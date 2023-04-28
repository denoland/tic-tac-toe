/**
 * This module implements the DB layer for the Tic Tac Toe game. It uses Deno's
 * key-value store to store data, and uses BroadcastChannel to perform real-time
 * synchronization between clients.
 */

import { Game, OauthSession, User } from "./types.ts";

const kv = await Deno.openKv();

export async function getAndDeleteOauthSession(
  session: string,
): Promise<OauthSession | null> {
  const res = await kv.get<OauthSession>(["oauth_sessions", session]);
  if (res.versionstamp === null) return null;
  await kv.delete(["oauth_sessions", session]);
  return res.value;
}

export async function setOauthSession(session: string, value: OauthSession) {
  await kv.set(["oauth_sessions", session], value);
}

export async function setUserWithSession(user: User, session: string) {
  await kv.atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function getUserBySession(session: string) {
  const res = await kv.get<User>(["users_by_session", session]);
  return res.value;
}

export async function getUserById(id: string) {
  const res = await kv.get<User>(["users", id]);
  return res.value;
}

export async function getUserByLogin(login: string) {
  const res = await kv.get<User>(["users_by_login", login]);
  return res.value;
}

export async function deleteSession(session: string) {
  await kv.delete(["users_by_session", session]);
}

export async function listRecentlySignedInUsers(): Promise<User[]> {
  const users = [];
  const iter = kv.list<User>({ prefix: ["users_by_last_signin"] }, {
    limit: 10,
    reverse: true,
  });
  for await (const { value } of iter) {
    users.push(value);
  }
  return users;
}

export async function setGame(game: Game, versionstamp?: string) {
  const ao = kv.atomic();
  if (versionstamp) {
    ao.check({ key: ["games", game.id], versionstamp });
  }
  const res = await ao
    .set(["games", game.id], game)
    .set(["games_by_user", game.initiator.id, game.id], game)
    .set(["games_by_user", game.opponent.id, game.id], game)
    .commit();
  if (res.ok) {
    console.log("broadcasting game update", game.id, res.versionstamp);
    const bc1 = new BroadcastChannel(`game/${game.id}`);
    bc1.postMessage({ game, versionstamp: res!.versionstamp });
    const bc2 = new BroadcastChannel(`games_by_user/${game.initiator.id}`);
    bc2.postMessage({ game, versionstamp: res!.versionstamp });
    const bc3 = new BroadcastChannel(`games_by_user/${game.opponent.id}`);
    bc3.postMessage({ game, versionstamp: res!.versionstamp });
    setTimeout(() => {
      bc1.close();
      bc2.close();
      bc3.close();
    }, 5);
  }
  return res.ok;
}

export async function listGamesByPlayer(userId: string): Promise<Game[]> {
  const games: Game[] = [];
  const iter = kv.list<Game>({ prefix: ["games_by_user", userId] });
  for await (const { value } of iter) {
    games.push(value);
  }
  return games;
}

export async function getGame(id: string) {
  const res = await kv.get<Game>(["games", id]);
  return res.value;
}

export async function getGameWithVersionstamp(id: string) {
  const res = await kv.get<Game>(["games", id]);
  if (res.versionstamp === null) return null;
  return [res.value, res.versionstamp] as const;
}

export function subscribeGame(
  id: string,
  cb: (game: Game) => void,
): () => void {
  const bc = new BroadcastChannel(`game/${id}`);
  let closed = false;
  let lastVersionstamp = "";
  getGameWithVersionstamp(id).then((res) => {
    if (closed) return;
    if (res) {
      lastVersionstamp = res[1];
      cb(res[0]);
    }
  });
  bc.onmessage = (ev) => {
    console.log(
      "received game update",
      id,
      ev.data.versionstamp,
      `(last: ${lastVersionstamp})`,
    );
    if (lastVersionstamp >= ev.data.versionstamp) return;
    cb(ev.data.game);
  };
  return () => {
    closed = true;
    bc.close();
  };
}

export function subscribeGamesByPlayer(
  userId: string,
  cb: (list: Game[]) => void,
) {
  const bc = new BroadcastChannel(`games_by_user/${userId}`);
  let closed = false;
  listGamesByPlayer(userId).then((list) => {
    if (closed) return;
    cb(list);
    const lastVersionstamps = new Map<string, string>();
    bc.onmessage = (e) => {
      const { game, versionstamp } = e.data;
      console.log(
        "received games_by_user update",
        game.id,
        versionstamp,
        `(last: ${lastVersionstamps.get(game.id)})`,
      );
      if ((lastVersionstamps.get(game.id) ?? "") >= versionstamp) return;
      lastVersionstamps.set(game.id, versionstamp);
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === game.id) {
          list[i] = game;
          cb(list);
          return;
        }
      }
      list.push(game);
      cb(list);
    };
  });
  return () => {
    closed = true;
    bc.close();
  };
}

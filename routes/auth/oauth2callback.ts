import { Handlers } from "$fresh/server.ts";
import { getSessionTokens, handleCallback } from "kv_oauth";
import { client } from "🛠️/kv_oauth.ts";
import { getAuthenticatedUser } from "🛠️/github.ts";
import { setUserWithSession } from "🛠️/db.ts";
import type { User } from "🛠️/types.ts";
import { getSetCookies } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async GET(req) {
    const resp = await handleCallback(req, client);
    const [{ value: session }] = getSetCookies(resp.headers);

    const tokens = await getSessionTokens(session);
    const ghUser = await getAuthenticatedUser(tokens!.accessToken);

    const user: User = {
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    };
    await setUserWithSession(user, session);

    return resp;
  },
};

import { Handlers } from "$fresh/server.ts";
import { getUserByLogin, getUserBySession, setGame } from "🛠️/db.ts";
import { Game, State } from "🛠️/types.ts";

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    if (!ctx.state.session) {
      return new Response("Not logged in", { status: 401 });
    }

    let opponent;
    const formData = await req.formData();
    opponent = formData.get("opponent");

    if (typeof opponent !== "string") {
      const url = new URL(req.url);
      opponent = url.searchParams.get("opponent");
    }

    if (typeof opponent !== "string") {
      return new Response("Missing or invalid opponent", { status: 400 });
    }

    if (opponent.startsWith("@")) {
      opponent = opponent.slice(1);
    }
    const [initiatorUser, opponentUser] = await Promise.all([
      getUserBySession(ctx.state.session),
      getUserByLogin(opponent),
    ]);
    if (!initiatorUser) return new Response("Not logged in", { status: 401 });
    if (!opponentUser) {
      return new Response(
        "Opponent user has not signed up yet. Ask them to sign in to TicTacToe to play against you.",
        { status: 400 },
      );
    }
    if (initiatorUser.id === opponentUser.id) {
      return new Response("Cannot play against yourself", { status: 400 });
    }

    const game: Game = {
      id: Math.random().toString(36).slice(2),
      initiator: initiatorUser,
      opponent: opponentUser,
      grid: [null, null, null, null, null, null, null, null, null],
      startedAt: new Date(),
      lastMoveAt: new Date(),
    };
    await setGame(game);

    return new Response(null, {
      status: 302,
      headers: {
        "Location": `/game/${game.id}`,
      },
    });
  },
};

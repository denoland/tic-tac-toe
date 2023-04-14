import { Handlers } from "$fresh/server.ts";
import { getGameWithVersionstamp, getUserBySession, setGame } from "🛠️/db.ts";
import { analyzeGame } from "🛠️/game.ts";
import { State } from "🛠️/types.ts";

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing id", {
        status: 400,
      });
    }
    const indexStr = url.searchParams.get("index");
    const index = Number(indexStr);
    if (!indexStr || index < 0 || index > 8) {
      return new Response("Invalid index", {
        status: 400,
      });
    }
    const [gameRes, user] = await Promise.all([
      getGameWithVersionstamp(id),
      getUserBySession(ctx.state.session ?? ""),
    ]);
    if (!gameRes) {
      return new Response("Game not found", {
        status: 404,
      });
    }
    const [game, gameVersionstamp] = gameRes;
    if (!user) {
      return new Response("Not signed in", {
        status: 401,
      });
    }
    const analysis = analyzeGame(game);
    if (analysis.state !== "in_progress") {
      return new Response("Game over", {
        status: 400,
      });
    }
    if (analysis.turn !== user.id) {
      return new Response("Not your turn", {
        status: 403,
      });
    }
    if (game.grid[index] !== null) {
      return new Response("Invalid move", {
        status: 400,
      });
    }
    game.grid[index] = user.id;
    const success = await setGame(game, gameVersionstamp);
    if (!success) {
      return new Response("Game has been updated/deleted while processing", {
        status: 409,
      });
    }
    return new Response(JSON.stringify(game), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};

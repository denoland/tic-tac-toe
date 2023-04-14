import { Handlers } from "$fresh/server.ts";
import { subscribeGame } from "🛠️/db.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing id", {
        status: 400,
      });
    }

    let cleanup: () => void;

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(`retry: 1000\n\n`);
        cleanup = subscribeGame(id, (game) => {
          const data = JSON.stringify(game);
          controller.enqueue(`data: ${data}\n\n`);
        });
      },
      cancel() {
        cleanup();
      },
    });

    return new Response(body.pipeThrough(new TextEncoderStream()), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  },
};

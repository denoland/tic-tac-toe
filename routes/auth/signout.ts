import { Handlers } from "$fresh/server.ts";
import { getSessionId, signOut } from "kv_oauth";
import { deleteSession } from "🛠️/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const sessionId = await getSessionId(req);
    if (sessionId !== undefined) await deleteSession(sessionId);

    return await signOut(req);
  },
};

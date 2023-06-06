import { Handlers } from "$fresh/server.ts";
import { getSessionId, signOut } from "kv_oauth";
import { deleteSession } from "🛠️/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const session = getSessionId(req);
    await deleteSession(session);

    return await signOut(req);
  },
};

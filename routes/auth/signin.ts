import { Handlers } from "$fresh/server.ts";
import { signIn } from "kv_oauth";
import { client } from "🛠️/kv_oauth.ts";

export const handler: Handlers = {
  async GET(req) {
    return await signIn(req, client);
  },
};

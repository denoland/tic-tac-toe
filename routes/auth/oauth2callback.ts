import { Handlers } from "$fresh/server.ts";
import { handleCallback } from "kv_oauth";
import { client } from "🛠️/kv_oauth.ts";
import { getAuthenticatedUser } from "🛠️/github.ts";
import { setUserWithSession } from "🛠️/db.ts";
import type { User } from "🛠️/types.ts";

export const handler: Handlers = {
  async GET(req) {
    const { response, tokens, sessionId } = await handleCallback(req, client);
    const ghUser = await getAuthenticatedUser(tokens!.accessToken);

    const user: User = {
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    };
    await setUserWithSession(user, sessionId);

    return response;
  },
};

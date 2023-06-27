import { Handlers } from "$fresh/server.ts";
import { handleCallback } from "kv_oauth";
import { oauth2Client } from "🛠️/oauth2_client.ts";
import { getAuthenticatedUser } from "🛠️/github.ts";
import { setUserWithSession } from "🛠️/db.ts";
import type { User } from "🛠️/types.ts";

export const handler: Handlers = {
  async GET(req) {
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      oauth2Client,
    );
    const ghUser = await getAuthenticatedUser(accessToken);

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

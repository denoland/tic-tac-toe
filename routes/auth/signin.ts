import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";
import { setOauthSession } from "🛠️/db.ts";
import { oauth2Client } from "🛠️/oauth.ts";

export const handler: Handlers = {
  async GET() {
    const oauthSession = crypto.randomUUID();
    const state = crypto.randomUUID();
    const { uri, codeVerifier } = await oauth2Client.code
      .getAuthorizationUri({ state });
    setOauthSession(oauthSession, { state, codeVerifier });
    const resp = new Response("Redirecting...", {
      headers: {
        Location: uri.href,
      },
      status: 307,
    });
    setCookie(resp.headers, {
      name: "oauth-session",
      value: oauthSession,
      path: "/",
      httpOnly: true,
    });
    return resp;
  },
};

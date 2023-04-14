import { Handlers } from "$fresh/server.ts";
import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import { getAndDeleteOauthSession, setUserWithSession } from "🛠️/db.ts";
import { getAuthenticatedUser } from "🛠️/github.ts";
import { oauth2Client } from "🛠️/oauth.ts";
import { User } from "🛠️/types.ts";

export const handler: Handlers = {
  async GET(req) {
    const cookies = getCookies(req.headers);
    const oauthSessionCookie = cookies["oauth-session"];
    if (!oauthSessionCookie) {
      return new Response("Missing oauth session", {
        status: 400,
      });
    }
    const oauthSession = await getAndDeleteOauthSession(oauthSessionCookie);
    if (!oauthSession) {
      return new Response("Missing oauth session", {
        status: 400,
      });
    }
    const { state, codeVerifier } = oauthSession;
    const tokens = await oauth2Client.code.getToken(req.url, {
      state,
      codeVerifier,
    });
    const ghUser = await getAuthenticatedUser(tokens.accessToken);

    const session = crypto.randomUUID();
    const user: User = {
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    };
    await setUserWithSession(user, session);

    const resp = new Response("Logged in", {
      headers: {
        Location: "/",
      },
      status: 307,
    });
    deleteCookie(resp.headers, "oauth-session");
    setCookie(resp.headers, {
      name: "session",
      value: session,
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });
    return resp;
  },
};

import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getSessionId } from "kv_oauth";
import { State } from "🛠️/types.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const url = new URL(req.url);
  if (url.pathname === "") return await ctx.next();
  ctx.state.session = await getSessionId(req);
  const resp = await ctx.next();
  return resp;
}

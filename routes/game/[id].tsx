import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { Game, State, User } from "🛠️/types.ts";
import { getGame, getUserBySession } from "🛠️/db.ts";

import { Header } from "🧱/Header.tsx";
import GameDisplay from "🏝️/GameDisplay.tsx";

interface Data {
  game: Game;
  user: User | null;
}

export async function handler(_req: Request, ctx: HandlerContext<Data, State>) {
  const [game, user] = await Promise.all([
    getGame(ctx.params.id),
    getUserBySession(ctx.state.session ?? ""),
  ]);
  if (!game) return ctx.renderNotFound();

  return ctx.render({ game, user });
}

export default function Home(props: PageProps<Data>) {
  const { game, user } = props.data;
  return (
    <>
      <Head>
        <title>
          {game.initiator.login} vs {game.opponent.login} | Tic-Tac-Toe
        </title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <Header user={user} />
        <GameDisplay game={game} user={user} />
      </div>
    </>
  );
}

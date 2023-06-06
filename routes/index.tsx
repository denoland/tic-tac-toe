import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { Game, State, User } from "🛠️/types.ts";
import {
  getUserBySession,
  listGamesByPlayer,
  listRecentlySignedInUsers,
} from "🛠️/db.ts";

import { Button, ButtonLink } from "🧱/Button.tsx";
import { UserNameVertical } from "🧱/User.tsx";
import { Header } from "🧱/Header.tsx";

import GamesList from "🏝️/GamesList.tsx";

type Data = SignedInData | null;

interface SignedInData {
  user: User;
  users: User[];
  games: Game[];
}

export async function handler(_req: Request, ctx: HandlerContext<Data, State>) {
  if (!ctx.state.session) return ctx.render(null);

  const [user, users] = await Promise.all([
    getUserBySession(ctx.state.session),
    listRecentlySignedInUsers(),
  ]);
  if (!user) return ctx.render(null);

  const games = await listGamesByPlayer(user.id);

  return ctx.render({ user, users, games });
}

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>Tic-Tac-Toe</title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <Header user={props.data?.user ?? null} />
        {props.data ? <SignedIn {...props.data} /> : <SignedOut />}
      </div>
    </>
  );
}

function SignedIn(props: SignedInData) {
  const otherUsers = props.users.filter((u) => u.id != props.user.id);
  return (
    <>
      <GamesList games={props.games} user={props.user} />
      <p class="my-6">
        Challenge someone to a game of Tic-Tac-Toe! Just enter their GitHub
        username in the box below and click "Start Game".
      </p>
      <form action="/start" method="POST">
        <input
          type="text"
          name="opponent"
          placeholder="@monalisa"
          class="w-full px-4 py-2 border border-gray-300 rounded-md flex-1"
          required
        />
        <Button type="submit" class="mt-4">
          Start Game
        </Button>
      </form>
      <p class="my-6">
        Or, challenge one of these other users:
      </p>
      <ul class="my-6">
        {otherUsers.map((u) => <UserListItem key={u.id} user={u} />)}
      </ul>
    </>
  );
}

/** A list item to display a user. Includes a button to challenge the user to a
 * game. Displays name, handle, and avatar. */
function UserListItem(props: { user: User }) {
  const startPath = `/start?opponent=${props.user.login}`;
  return (
    <li class="flex items-center">
      <img
        class="w-8 h-8 mr-2 rounded-full"
        src={props.user.avatarUrl}
        alt={props.user.login}
      />
      <UserNameVertical class="flex-1" user={props.user} />
      <form action={startPath} method="POST">
        <ButtonLink
          type="button"
          class="my-2"
          /** @ts-ignore */
          onclick="event.preventDefault();this.closest('form').submit();"
          href={startPath}
        >
          Start Game
        </ButtonLink>
      </form>
    </li>
  );
}

function SignedOut() {
  return (
    <>
      <p class="my-6">
        Welcome to the Deno Tic-Tac-Toe game! You can log in with your GitHub
        account below to challenge others to a game of Tic-Tac-Toe.
      </p>
      <p class="my-6">
        <ButtonLink href="/auth/signin">
          Log in with GitHub
        </ButtonLink>
      </p>
    </>
  );
}

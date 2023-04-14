import { User } from "🛠️/types.ts";
import { UserNameHorizontal } from "./User.tsx";

const linkClass = "text-sm text-blue-500 hover:underline";

export function Header(props: { user: User | null }) {
  return (
    <>
      <div class="flex justify-between items-center">
        <h1 class="text-4xl font-bold">Tic-Tac-Toe</h1>
        <a
          href="https://github.com/denoland/tic-tac-toe"
          class={`${linkClass} text-right`}
        >
          View on GitHub
        </a>
      </div>

      <div class="flex items-center justify-between">
        {props.user
          ? (
            <>
              <p class="text-sm text-gray-600">
                Logged in as <UserNameHorizontal user={props.user} />
              </p>
              <a class={linkClass} href="/auth/signout">
                Log out
              </a>
            </>
          )
          : (
            <>
              <p class="text-sm text-gray-600">
                Anonymous user
              </p>
              <a class={linkClass} href="/auth/signin">
                Log in
              </a>
            </>
          )}
      </div>
    </>
  );
}

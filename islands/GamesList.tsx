import { useState } from "preact/hooks";
import { tw } from "twind";
import { css, keyframes } from "twind/css";

import { Game, User } from "🛠️/types.ts";
import { analyzeGame, GameStateInProgress } from "🛠️/game.ts";
import { useDataSubscription } from "🛠️/hooks.ts";

import { UserNameHorizontal } from "🧱/User.tsx";
import { ButtonLink, ButtonLinkMovingRainbow } from "🧱/Button.tsx";

export default function GameList(props: { games: Game[]; user: User }) {
  const [games, setGames] = useState(() =>
    props.games.map((g) => ({
      ...g,
      startedAt: new Date(g.startedAt),
      lastMoveAt: new Date(g.lastMoveAt),
    }))
  );

  useDataSubscription(() => {
    const eventSource = new EventSource(`/api/events/games`);
    eventSource.onmessage = (e) => {
      const games = JSON.parse(e.data);
      setGames(games.map((g: Game) => ({
        ...g,
        startedAt: new Date(g.startedAt),
        lastMoveAt: new Date(g.lastMoveAt),
      })));
    };
    return () => eventSource.close();
  }, []);

  const analyzedGames = games.map((game) => ({
    ...game,
    ...analyzeGame(game),
  }));
  const activeGames = analyzedGames.filter((g) =>
    g.state === "in_progress"
  ) as (Game & GameStateInProgress)[];
  // sort by whose turn it is (current user's turn first) and then by last move time (oldest first)
  activeGames.sort((a, b) => {
    const aIsMyTurn = a.turn === props.user.id;
    const bIsMyTurn = b.turn === props.user.id;
    if (aIsMyTurn && !bIsMyTurn) return -1;
    if (!aIsMyTurn && bIsMyTurn) return 1;
    return b.lastMoveAt.getTime() - a.lastMoveAt.getTime();
  });
  const wins =
    analyzedGames.filter((g) => g.state === "win" && g.winner === props.user.id)
      .length;
  const losses =
    analyzedGames.filter((g) => g.state === "win" && g.winner !== props.user.id)
      .length;
  const ties = analyzedGames.filter((g) => g.state === "tie").length;

  return (
    <div class="my-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="grid gap-4 grid-cols-3 sm:grid-cols-1">
        <div class="border rounded-lg p-2 text-center">
          <h2 class="text-lg font-semibold">Wins 🏆</h2>
          <p class="text-4xl font-bold">
            {wins}
          </p>
        </div>
        <div class="border rounded-lg p-2 text-center">
          <h2 class="text-lg font-semibold">Losses 😭</h2>
          <p class="text-4xl font-bold">
            {losses}
          </p>
        </div>
        <div class="border rounded-lg p-2 text-center">
          <h2 class="text-lg font-semibold">Ties 😐</h2>
          <p class="text-4xl font-bold">
            {ties}
          </p>
        </div>
      </div>

      <div class="border rounded-lg sm:col-span-3 flex flex-col max-h-72">
        <h2 class="px-4 pt-2 text-lg font-semibold">
          Active Games
        </h2>
        <p class="px-4 pb-2 text(sm gray-500)">
          {activeGames.length} in progress games
        </p>

        <ul class="flex-grow-1 overflow-y-auto">
          {activeGames.length
            ? activeGames.map((game) => (
              <GameListItem
                game={game}
                currentUser={props.user}
                key={game.id}
              />
            ))
            : (
              <li class="text-gray-600 px-4 py-2 border-t">
                No active games right now. Start one below!
              </li>
            )}
        </ul>
        {
          /* <a
          class="px-4 py-1 border-t text(sm gray-600 center) hover:bg-gray-50 block"
          href="/games"
        >
          See full game history
        </a> */
        }
      </div>
    </div>
  );
}

const rainbowBackgroundKeyframes = keyframes({
  "0%": { backgroundPosition: "0% 50%" },
  "100%": { backgroundPosition: "100% 50%" },
});
const rainbowBackground = css`
background: linear-gradient(to right, 
  #ff008022, #ff3d4d22, #ff684422, #ff8c0022, #f1c40f22, #2ecc7122, #3498db22, #8e44ad22, #ff008022, #ff008022);
background-size: 2000% 100%;
animation: ${rainbowBackgroundKeyframes} 7s linear infinite;
`;

function GameListItem(
  props: { currentUser: User; game: Game & GameStateInProgress },
) {
  const { game, currentUser } = props;

  const otherPlayer = game.initiator.id == currentUser.id
    ? game.opponent
    : game.initiator;

  const currentPlayersTurn = currentUser.id == game.turn;

  const state = currentPlayersTurn ? "Your Turn" : "Opponent's Turn";

  return (
    <li
      class={tw`flex items-center ${
        currentPlayersTurn && rainbowBackground
      } px-4 py-2 border-t`}
    >
      <img
        class="w-8 h-8 mr-2 rounded-full"
        src={otherPlayer.avatarUrl}
        alt={otherPlayer.login}
      />
      <div class="flex-1">
        <p class="font-semibold">
          You vs <UserNameHorizontal user={otherPlayer} />
        </p>
        <p class="text-sm text-gray-600">
          {state}
        </p>
      </div>
      {currentUser.id == game.turn
        ? (
          <ButtonLinkMovingRainbow href={`/game/${game.id}`}>
            Make Move!
          </ButtonLinkMovingRainbow>
        )
        : <ButtonLink href={`/game/${game.id}`}>Observe</ButtonLink>}
    </li>
  );
}

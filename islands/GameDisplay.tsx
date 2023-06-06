import { useState } from "preact/hooks";
import { tw } from "twind";

import { Game, User } from "🛠️/types.ts";
import { analyzeGame, GameState } from "🛠️/game.ts";
import { useDataSubscription } from "🛠️/hooks.ts";

import { UserNameHorizontal, UserNameVertical } from "🧱/User.tsx";
import { rainbowBackground } from "🧱/animations.ts";

export default function GameDisplay(props: { game: Game; user: User | null }) {
  const { user } = props;
  const [game, setGame] = useState(props.game);

  useDataSubscription(() => {
    const eventSource = new EventSource(
      `/api/events/game?id=${encodeURIComponent(props.game.id)}`,
    );
    eventSource.onmessage = (e) => {
      const newGame = JSON.parse(e.data) as Game;
      setGame(newGame);
    };
    return () => eventSource.close();
  }, [props.game.id]);

  const state = analyzeGame(game);

  const initiatorTurn = state.state === "in_progress" &&
    state.turn === game.initiator.id;
  const opponentTurn = state.state === "in_progress" &&
    state.turn === game.opponent.id;

  const initiatorWon = state.state === "win" &&
    state.winner === game.initiator.id;
  const opponentWon = state.state === "win" &&
    state.winner === game.opponent.id;

  return (
    <>
      <div class="grid sm:grid-cols-2 w-full mt-6 border(t l r) rounded(tl-xl tr-xl) overflow-hidden">
        <div
          class={`flex justify-between items-center gap-4 p-4 border-b sm:border-r ${
            initiatorWon && "bg-yellow-200"
          }`}
        >
          <img
            class="w-16 h-16 rounded-full"
            src={game.initiator.avatarUrl}
            alt={game.initiator.name}
          />
          <UserNameVertical user={game.initiator} class="w-full" />
          {initiatorTurn && <div class="text-2xl mx-2">✏️</div>}
          {initiatorWon && <div class="text-4xl mx-2">🏆</div>}
          <div class="text-2xl mx-2">
            ❌
          </div>
        </div>
        <div
          class={tw`flex items-center justify-between gap-4 p-4 border-b ${
            opponentWon && "bg-yellow-200"
          }`}
        >
          <div class="text-2xl mx-2">
            ⭕
          </div>
          {opponentWon && <div class="text-2xl mx-2">🏆</div>}
          {opponentTurn && <div class="text-2xl mx-2">✏️</div>}
          <UserNameVertical user={game.opponent} class="text-right w-full" />
          <img
            class="w-16 h-16 rounded-full"
            src={game.opponent.avatarUrl}
            alt={game.opponent.name}
          />
        </div>
      </div>
      <div
        class={tw`border(b l r) rounded(bl-xl br-xl) mb-6 text-xl sm:text-2xl text-center p-4 ${
          state.state === "in_progress" && state.turn === user?.id &&
          rainbowBackground
        }`}
      >
        {state.state === "win" && (
          <>{state.winner === game.initiator.id ? "❌" : "⭕"} wins!</>
        )}
        {state.state === "in_progress" && (
          state.turn === user?.id ? <>Your turn!</> : (
            <>
              Waiting for{" "}
              <UserNameHorizontal
                user={state.turn === game.initiator.id
                  ? game.initiator
                  : game.opponent}
              />...
            </>
          )
        )}
        {state.state === "tie" && <>Tie!</>}
      </div>

      <div class="grid grid-cols-3 max-w-md mx-auto">
        {game.grid.map((_, i) => (
          <GameCell
            index={i}
            game={game}
            user={user}
            state={state}
          />
        ))}
      </div>
    </>
  );
}

function GameCell(
  props: { index: number; game: Game; state: GameState; user: User | null },
) {
  const { game, index, user, state } = props;
  const onClick = async () => {
    if (
      state.state !== "in_progress" || state.turn !== user?.id ||
      game.grid[index] !== null
    ) return;
    const res = await fetch(`/api/place?id=${game.id}&index=${index}`, {
      method: "POST",
    });
    if (res.status !== 200) {
      alert("Something went wrong");
    }
  };

  const value = game.grid[index];
  const display = value === null
    ? ""
    : value === game.initiator.id
    ? "❌"
    : "⭕";

  return (
    <div
      class="w-full border-[1px] box-border text-8xl flex items-center justify-center"
      style="aspect-ratio: 1/1"
      onClick={onClick}
    >
      {display}
    </div>
  );
}

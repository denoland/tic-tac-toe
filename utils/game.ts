import { Game } from "./types.ts";

export interface GameStateInProgress {
  state: "in_progress";
  turn: string;
}

export interface GameStateTie {
  state: "tie";
}

export interface GameStateWin {
  state: "win";
  winner: string;
}

export type GameState = GameStateInProgress | GameStateTie | GameStateWin;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// GameGrid is a 9-element array of user id strings or nulls
export function analyzeGame(game: Game): GameState {
  const { grid, initiator: initiatorUser, opponent: opponentUser } = game;

  // Determine whose turn it is next
  let initiator = 0;
  let opponent = 0;
  for (const cell of grid) {
    if (cell === initiatorUser.id) {
      initiator++;
    } else if (cell === opponentUser.id) {
      opponent++;
    }
  }
  const turn = initiator > opponent ? opponentUser.id : initiatorUser.id;

  // Check for a win, or a tie situation. Ties can occur when all cells are
  // filled, or when all winning lines contain a mix of both players' ids.
  let allFilled = true;
  let allMixed = true;
  for (const [a, b, c] of WIN_LINES) {
    const cells = new Set([grid[a], grid[b], grid[c]]);
    if (cells.size === 1 && cells.has(initiatorUser.id)) {
      return { state: "win", winner: initiatorUser.id };
    }
    if (cells.size === 1 && cells.has(opponentUser.id)) {
      return { state: "win", winner: opponentUser.id };
    }
    if (cells.has(null)) {
      allFilled = false;
    }
    cells.delete(null);
    if (cells.size !== 2) {
      allMixed = false;
    }
  }
  if (allFilled || allMixed) {
    return { state: "tie" };
  }
  return { state: "in_progress", turn };
}

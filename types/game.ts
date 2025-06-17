export type Player = 'red' | 'yellow';
export type CellState = Player | null;
export type Board = CellState[][];
export type GameState = 'playing' | 'won' | 'draw';

export interface GameStats {
  redWins: number;
  yellowWins: number;
  draws: number;
  totalGames: number;
}

export interface WinCondition {
  player: Player;
  positions: [number, number][];
}
export type Player = 'red' | 'yellow';
export type CellState = Player | null | 'red-king' | 'yellow-king';
export type Board = CellState[][];
export type GameState = 'playing' | 'won' | 'draw';
export type GameVariant = 'connect3' | 'classic';

export interface GameStats {
  redWins: number;
  yellowWins: number;
  draws: number;
  totalGames: number;
  classicRedWins: number;
  classicYellowWins: number;
  classicDraws: number;
  classicTotalGames: number;
}

export interface WinCondition {
  player: Player;
  positions: [number, number][];
  type: 'regular' | 'king';
}

export interface KingConversion {
  positions: [number, number][];
  player: Player;
}
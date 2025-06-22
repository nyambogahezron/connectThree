export interface ScoreEvent {
  type: 'match' | 'cascade' | 'achievement' | 'bonus';
  points: number;
  multiplier: number;
  description: string;
  timestamp: number;
}

export interface CascadeData {
  level: number;
  multiplier: number;
  totalMatches: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameScore {
  currentScore: number;
  basePoints: number;
  bonusPoints: number;
  cascadeMultiplier: number;
  currentCascadeLevel: number;
  totalMatches: number;
  achievements: Achievement[];
  scoreEvents: ScoreEvent[];
  highScore: number;
  totalLifetimeScore: number;
}

export interface LevelStats {
  movesUsed: number;
  parMoves: number;
  timeElapsed: number;
  perfectGame: boolean;
  cascadeCount: number;
  maxCascadeLevel: number;
}

export type ScoreAnimation = {
  id: string;
  points: number;
  position: { x: number; y: number };
  color: string;
  scale: number;
  opacity: number;
};
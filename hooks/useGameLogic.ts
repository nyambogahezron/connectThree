import { useState, useCallback } from 'react';
import { Board, Player, GameState, CellState, WinCondition } from '@/types/game';

const ROWS = 6;
const COLS = 5;

export interface GameMode {
  type: 'pvp' | 'ai';
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

export const useGameLogic = () => {
  const [board, setBoard] = useState<Board>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [winCondition, setWinCondition] = useState<WinCondition | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>({ type: 'pvp' });

  const createEmptyBoard = (): Board => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

  const checkWin = (board: Board, row: number, col: number, player: Player): WinCondition | null => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1],  // diagonal /
    ];

    for (const [deltaRow, deltaCol] of directions) {
      const positions: [number, number][] = [[row, col]];
      
      // Check forward direction
      for (let i = 1; i < 3; i++) {
        const newRow = row + i * deltaRow;
        const newCol = col + i * deltaCol;
        if (
          newRow >= 0 && newRow < ROWS &&
          newCol >= 0 && newCol < COLS &&
          board[newRow][newCol] === player
        ) {
          positions.push([newRow, newCol]);
        } else {
          break;
        }
      }
      
      // Check backward direction
      for (let i = 1; i < 3; i++) {
        const newRow = row - i * deltaRow;
        const newCol = col - i * deltaCol;
        if (
          newRow >= 0 && newRow < ROWS &&
          newCol >= 0 && newCol < COLS &&
          board[newRow][newCol] === player
        ) {
          positions.unshift([newRow, newCol]);
        } else {
          break;
        }
      }

      if (positions.length >= 3) {
        return { player, positions: positions.slice(0, 3) };
      }
    }

    return null;
  };

  const isBoardFull = (board: Board): boolean => {
    return board[0].every(cell => cell !== null);
  };

  const findLowestEmptyRow = (board: Board, col: number): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        return row;
      }
    }
    return -1;
  };

  const makeMove = useCallback((col: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (gameState !== 'playing' || isAnimating) {
        resolve(false);
        return;
      }

      const row = findLowestEmptyRow(board, col);
      if (row === -1) {
        resolve(false);
        return;
      }

      setIsAnimating(true);

      // Simulate animation delay
      setTimeout(() => {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          newBoard[row][col] = currentPlayer;

          const win = checkWin(newBoard, row, col, currentPlayer);
          if (win) {
            setWinCondition(win);
            setGameState('won');
          } else if (isBoardFull(newBoard)) {
            setGameState('draw');
          } else {
            setCurrentPlayer(prev => prev === 'red' ? 'yellow' : 'red');
          }

          return newBoard;
        });

        setIsAnimating(false);
        resolve(true);
      }, 300);
    });
  }, [board, currentPlayer, gameState, isAnimating]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('red');
    setGameState('playing');
    setWinCondition(null);
    setIsAnimating(false);
  }, []);

  const isColumnFull = useCallback((col: number): boolean => {
    return board[0][col] !== null;
  }, [board]);

  const setGameModeHandler = useCallback((mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  }, [resetGame]);

  return {
    board,
    currentPlayer,
    gameState,
    winCondition,
    isAnimating,
    gameMode,
    makeMove,
    resetGame,
    isColumnFull,
    setGameMode: setGameModeHandler,
  };
};
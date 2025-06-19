import { useState, useCallback } from 'react';
import { Board, Player, GameState, CellState, WinCondition, GameVariant, KingConversion } from '@/types/game';

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
  const [gameVariant, setGameVariant] = useState<GameVariant>('connect3');
  const [kingConversions, setKingConversions] = useState<KingConversion[]>([]);

  const createEmptyBoard = (): Board => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

  const isKing = (cell: CellState): boolean => {
    return cell === 'red-king' || cell === 'yellow-king';
  };

  const getPlayerFromCell = (cell: CellState): Player | null => {
    if (cell === 'red' || cell === 'red-king') return 'red';
    if (cell === 'yellow' || cell === 'yellow-king') return 'yellow';
    return null;
  };

  const getKingType = (player: Player): CellState => {
    return player === 'red' ? 'red-king' : 'yellow-king';
  };

  const checkMatch = (board: Board, row: number, col: number, player: Player): [number, number][] | null => {
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
          getPlayerFromCell(board[newRow][newCol]) === player
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
          getPlayerFromCell(board[newRow][newCol]) === player
        ) {
          positions.unshift([newRow, newCol]);
        } else {
          break;
        }
      }

      if (positions.length >= 3) {
        return positions.slice(0, 3);
      }
    }

    return null;
  };

  const checkKingWin = (board: Board, player: Player): [number, number][] | null => {
    const kingType = getKingType(player);
    
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] === kingType) {
          const match = checkMatch(board, row, col, player);
          if (match) {
            // Verify all positions are kings
            const allKings = match.every(([r, c]) => board[r][c] === kingType);
            if (allKings) {
              return match;
            }
          }
        }
      }
    }
    
    return null;
  };

  const isBoardFull = (board: Board): boolean => {
    return board[0].every(cell => cell !== null);
  };

  const countKings = (board: Board, player: Player): number => {
    const kingType = getKingType(player);
    let count = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] === kingType) {
          count++;
        }
      }
    }
    return count;
  };

  const findLowestEmptyRow = (board: Board, col: number): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        return row;
      }
    }
    return -1;
  };

  // Find the lowest available position among the matched positions
  const findLowestKingPosition = (board: Board, matchPositions: [number, number][]): [number, number] => {
    // Group positions by column
    const columnGroups: { [col: number]: [number, number][] } = {};
    matchPositions.forEach(([row, col]) => {
      if (!columnGroups[col]) {
        columnGroups[col] = [];
      }
      columnGroups[col].push([row, col]);
    });

    // Find the column with the lowest available position after clearing matches
    let bestPosition: [number, number] = matchPositions[0];
    let lowestRow = -1;

    for (const col in columnGroups) {
      const colNum = parseInt(col);
      const colPositions = columnGroups[colNum];
      
      // Create a temporary board with matches cleared
      const tempBoard = board.map(row => [...row]);
      matchPositions.forEach(([r, c]) => {
        tempBoard[r][c] = null;
      });

      // Find the lowest empty row in this column
      const lowestEmptyRow = findLowestEmptyRow(tempBoard, colNum);
      
      if (lowestEmptyRow > lowestRow) {
        lowestRow = lowestEmptyRow;
        bestPosition = [lowestEmptyRow, colNum];
      }
    }

    return bestPosition;
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

          if (gameVariant === 'classic') {
            // Check for matches to convert to kings
            const match = checkMatch(newBoard, row, col, currentPlayer);
            if (match) {
              // Find the lowest position for the king
              const kingPosition = findLowestKingPosition(newBoard, match);
              const kingType = getKingType(currentPlayer);
              
              // Clear matched positions
              match.forEach(([r, c]) => {
                newBoard[r][c] = null;
              });
              
              // Place king at the lowest available position
              newBoard[kingPosition[0]][kingPosition[1]] = kingType;
              
              // Store conversion for animation
              setKingConversions(prev => [...prev, { positions: match, player: currentPlayer }]);
              
              // Clear conversions after animation
              setTimeout(() => {
                setKingConversions([]);
              }, 1000);
            }

            // Check for king win
            const kingWin = checkKingWin(newBoard, currentPlayer);
            if (kingWin) {
              setWinCondition({ player: currentPlayer, positions: kingWin, type: 'king' });
              setGameState('won');
            } else if (isBoardFull(newBoard)) {
              // Check who has more kings
              const redKings = countKings(newBoard, 'red');
              const yellowKings = countKings(newBoard, 'yellow');
              
              if (redKings > yellowKings) {
                setWinCondition({ player: 'red', positions: [], type: 'king' });
                setGameState('won');
              } else if (yellowKings > redKings) {
                setWinCondition({ player: 'yellow', positions: [], type: 'king' });
                setGameState('won');
              } else {
                setGameState('draw');
              }
            } else {
              setCurrentPlayer(prev => prev === 'red' ? 'yellow' : 'red');
            }
          } else {
            // Original Connect 3 logic
            const match = checkMatch(newBoard, row, col, currentPlayer);
            if (match) {
              setWinCondition({ player: currentPlayer, positions: match, type: 'regular' });
              setGameState('won');
            } else if (isBoardFull(newBoard)) {
              setGameState('draw');
            } else {
              setCurrentPlayer(prev => prev === 'red' ? 'yellow' : 'red');
            }
          }

          return newBoard;
        });

        setIsAnimating(false);
        resolve(true);
      }, 300);
    });
  }, [board, currentPlayer, gameState, isAnimating, gameVariant]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('red');
    setGameState('playing');
    setWinCondition(null);
    setIsAnimating(false);
    setKingConversions([]);
  }, []);

  const isColumnFull = useCallback((col: number): boolean => {
    return board[0][col] !== null;
  }, [board]);

  const setGameModeHandler = useCallback((mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  }, [resetGame]);

  const setGameVariantHandler = useCallback((variant: GameVariant) => {
    setGameVariant(variant);
    resetGame();
  }, [resetGame]);

  const getKingCounts = useCallback(() => {
    return {
      red: countKings(board, 'red'),
      yellow: countKings(board, 'yellow'),
    };
  }, [board]);

  return {
    board,
    currentPlayer,
    gameState,
    winCondition,
    isAnimating,
    gameMode,
    gameVariant,
    kingConversions,
    makeMove,
    resetGame,
    isColumnFull,
    setGameMode: setGameModeHandler,
    setGameVariant: setGameVariantHandler,
    getKingCounts,
    isKing,
    getPlayerFromCell,
  };
};
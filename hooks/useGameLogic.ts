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
  const [cascadeLevel, setCascadeLevel] = useState(0);
  const [pendingCascades, setPendingCascades] = useState<Array<{
    board: Board;
    player: Player;
    level: number;
  }>>([]);

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

  // Apply gravity to make pieces fall down
  const applyGravity = (board: Board): { newBoard: Board; hasChanges: boolean } => {
    const newBoard = board.map(row => [...row]);
    let hasChanges = false;

    for (let col = 0; col < COLS; col++) {
      // Collect all non-null pieces in this column
      const pieces: CellState[] = [];
      for (let row = 0; row < ROWS; row++) {
        if (newBoard[row][col] !== null) {
          pieces.push(newBoard[row][col]);
          newBoard[row][col] = null;
        }
      }

      // Place pieces at the bottom
      for (let i = 0; i < pieces.length; i++) {
        const targetRow = ROWS - 1 - i;
        if (newBoard[targetRow][col] !== pieces[pieces.length - 1 - i]) {
          hasChanges = true;
        }
        newBoard[targetRow][col] = pieces[pieces.length - 1 - i];
      }
    }

    return { newBoard, hasChanges };
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

  // Find all matches on the board
  const findAllMatches = (board: Board): Array<{ player: Player; positions: [number, number][]; isKing: boolean }> => {
    const matches: Array<{ player: Player; positions: [number, number][]; isKing: boolean }> = [];
    const checkedPositions = new Set<string>();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = board[row][col];
        if (cell === null) continue;

        const posKey = `${row}-${col}`;
        if (checkedPositions.has(posKey)) continue;

        const player = getPlayerFromCell(cell);
        if (!player) continue;

        const match = checkMatch(board, row, col, player);
        if (match) {
          // Mark all positions in this match as checked
          match.forEach(([r, c]) => checkedPositions.add(`${r}-${c}`));
          
          matches.push({
            player,
            positions: match,
            isKing: isKing(cell),
          });
        }
      }
    }

    return matches;
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

  // Find the lowest available position for king placement
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
      
      // Create a temporary board with matches cleared
      const tempBoard = board.map(row => [...row]);
      matchPositions.forEach(([r, c]) => {
        tempBoard[r][c] = null;
      });

      // Apply gravity to see where pieces would fall
      const { newBoard } = applyGravity(tempBoard);
      const lowestEmptyRow = findLowestEmptyRow(newBoard, colNum);
      
      if (lowestEmptyRow > lowestRow) {
        lowestRow = lowestEmptyRow;
        bestPosition = [lowestEmptyRow, colNum];
      }
    }

    return bestPosition;
  };

  // Process cascades recursively
  const processCascades = useCallback((
    initialBoard: Board,
    currentCascadeLevel: number,
    onMatchFound?: (matchSize: number, cascadeLevel: number, isKing: boolean, simultaneousMatches: number) => void
  ): Promise<{ finalBoard: Board; totalCascades: number }> => {
    return new Promise((resolve) => {
      let workingBoard = initialBoard.map(row => [...row]);
      let totalCascades = currentCascadeLevel;

      const processNextCascade = () => {
        // Apply gravity first
        const { newBoard: gravityBoard, hasChanges } = applyGravity(workingBoard);
        workingBoard = gravityBoard;

        if (!hasChanges) {
          // No more cascades possible
          resolve({ finalBoard: workingBoard, totalCascades });
          return;
        }

        // Check for new matches after gravity
        const matches = findAllMatches(workingBoard);
        
        if (matches.length === 0) {
          // No more matches
          resolve({ finalBoard: workingBoard, totalCascades });
          return;
        }

        // Process matches
        const conversions: KingConversion[] = [];
        
        matches.forEach(match => {
          if (gameVariant === 'classic') {
            // Clear matched positions
            match.positions.forEach(([r, c]) => {
              workingBoard[r][c] = null;
            });

            // Find position for king
            const kingPosition = findLowestKingPosition(workingBoard, match.positions);
            const kingType = getKingType(match.player);
            
            // Place king
            workingBoard[kingPosition[0]][kingPosition[1]] = kingType;
            
            // Store conversion for animation
            conversions.push({ positions: match.positions, player: match.player });
          } else {
            // Connect3 mode - just clear matches (this shouldn't happen in cascades for connect3)
            match.positions.forEach(([r, c]) => {
              workingBoard[r][c] = null;
            });
          }

          // Notify about the match
          if (onMatchFound) {
            onMatchFound(match.positions.length, totalCascades, match.isKing, matches.length);
          }
        });

        // Update conversions for animation
        if (conversions.length > 0) {
          setKingConversions(prev => [...prev, ...conversions]);
          
          // Clear conversions after animation
          setTimeout(() => {
            setKingConversions(prev => 
              prev.filter(conv => !conversions.some(newConv => 
                newConv.player === conv.player && 
                JSON.stringify(newConv.positions) === JSON.stringify(conv.positions)
              ))
            );
          }, 1000);
        }

        totalCascades++;
        
        // Continue processing cascades after a delay
        setTimeout(() => {
          processNextCascade();
        }, 500);
      };

      // Start cascade processing
      setTimeout(() => {
        processNextCascade();
      }, 300);
    });
  }, [gameVariant]);

  const makeMove = useCallback((
    col: number,
    onMatchFound?: (matchSize: number, cascadeLevel: number, isKing: boolean, simultaneousMatches: number) => void
  ): Promise<boolean> => {
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
      setCascadeLevel(0);

      // Simulate animation delay
      setTimeout(async () => {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = currentPlayer;

        if (gameVariant === 'classic') {
          // Check for initial match
          const initialMatch = checkMatch(newBoard, row, col, currentPlayer);
          if (initialMatch) {
            // Clear matched positions
            initialMatch.forEach(([r, c]) => {
              newBoard[r][c] = null;
            });

            // Find position for king
            const kingPosition = findLowestKingPosition(newBoard, initialMatch);
            const kingType = getKingType(currentPlayer);
            
            // Place king
            newBoard[kingPosition[0]][kingPosition[1]] = kingType;
            
            // Store conversion for animation
            setKingConversions([{ positions: initialMatch, player: currentPlayer }]);
            
            // Clear conversions after animation
            setTimeout(() => {
              setKingConversions([]);
            }, 1000);

            // Notify about initial match
            if (onMatchFound) {
              onMatchFound(initialMatch.length, 0, false, 1);
            }

            // Process cascades
            const { finalBoard, totalCascades } = await processCascades(newBoard, 0, onMatchFound);
            
            setBoard(finalBoard);
            setCascadeLevel(totalCascades);

            // Check for king win
            const kingWin = checkKingWin(finalBoard, currentPlayer);
            if (kingWin) {
              setWinCondition({ player: currentPlayer, positions: kingWin, type: 'king' });
              setGameState('won');
            } else if (isBoardFull(finalBoard)) {
              // Check who has more kings
              const redKings = countKings(finalBoard, 'red');
              const yellowKings = countKings(finalBoard, 'yellow');
              
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
            // No initial match, just apply gravity and check for cascades
            const { finalBoard } = await processCascades(newBoard, 0, onMatchFound);
            setBoard(finalBoard);
            setCurrentPlayer(prev => prev === 'red' ? 'yellow' : 'red');
          }
        } else {
          // Original Connect 3 logic
          const match = checkMatch(newBoard, row, col, currentPlayer);
          if (match) {
            setWinCondition({ player: currentPlayer, positions: match, type: 'regular' });
            setGameState('won');
            
            // Notify about match
            if (onMatchFound) {
              onMatchFound(match.length, 0, false, 1);
            }
          } else if (isBoardFull(newBoard)) {
            setGameState('draw');
          } else {
            setCurrentPlayer(prev => prev === 'red' ? 'yellow' : 'red');
          }
          
          setBoard(newBoard);
        }

        setIsAnimating(false);
        resolve(true);
      }, 300);
    });
  }, [board, currentPlayer, gameState, isAnimating, gameVariant, processCascades]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('red');
    setGameState('playing');
    setWinCondition(null);
    setIsAnimating(false);
    setKingConversions([]);
    setCascadeLevel(0);
    setPendingCascades([]);
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
    cascadeLevel,
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
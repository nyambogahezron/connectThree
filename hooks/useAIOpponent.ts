import { useCallback } from 'react';
import { Board, Player } from '@/interfaces/game';

interface MoveEvaluation {
	column: number;
	score: number;
	moveType: 'win' | 'block' | 'strategic' | 'random';
}

interface AIMove {
	column: number;
	confidence: number;
	moveType: string;
	predictedAdvantage: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

const ROWS = 6;
const COLS = 5;

export const useAIOpponent = () => {
	// Check if a move would result in a win
	const checkWinningMove = useCallback(
		(board: Board, col: number, player: Player): boolean => {
			const newBoard = board.map((row) => [...row]);
			const row = findLowestEmptyRow(newBoard, col);

			if (row === -1) return false;

			newBoard[row][col] = player;
			return checkWin(newBoard, row, col, player) !== null;
		},
		[]
	);

	// Find the lowest empty row in a column
	const findLowestEmptyRow = useCallback(
		(board: Board, col: number): number => {
			for (let row = ROWS - 1; row >= 0; row--) {
				if (board[row][col] === null) {
					return row;
				}
			}
			return -1;
		},
		[]
	);

	// Check for win condition
	const checkWin = useCallback(
		(board: Board, row: number, col: number, player: Player) => {
			const directions = [
				[0, 1], // horizontal
				[1, 0], // vertical
				[1, 1], // diagonal \
				[1, -1], // diagonal /
			];

			for (const [deltaRow, deltaCol] of directions) {
				const positions: [number, number][] = [[row, col]];

				// Check forward direction
				for (let i = 1; i < 3; i++) {
					const newRow = row + i * deltaRow;
					const newCol = col + i * deltaCol;
					if (
						newRow >= 0 &&
						newRow < ROWS &&
						newCol >= 0 &&
						newCol < COLS &&
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
						newRow >= 0 &&
						newRow < ROWS &&
						newCol >= 0 &&
						newCol < COLS &&
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
		},
		[]
	);

	// Evaluate potential for creating winning combinations
	const evaluatePosition = useCallback(
		(board: Board, row: number, col: number, player: Player): number => {
			let score = 0;
			const directions = [
				[0, 1], // horizontal
				[1, 0], // vertical
				[1, 1], // diagonal \
				[1, -1], // diagonal /
			];

			for (const [deltaRow, deltaCol] of directions) {
				let consecutiveCount = 1;
				let emptySpaces = 0;
				let blocked = false;

				// Check forward direction
				for (let i = 1; i < 3; i++) {
					const newRow = row + i * deltaRow;
					const newCol = col + i * deltaCol;

					if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
						blocked = true;
						break;
					}

					if (board[newRow][newCol] === player) {
						consecutiveCount++;
					} else if (board[newRow][newCol] === null) {
						emptySpaces++;
						break;
					} else {
						blocked = true;
						break;
					}
				}

				// Check backward direction
				if (!blocked) {
					for (let i = 1; i < 3; i++) {
						const newRow = row - i * deltaRow;
						const newCol = col - i * deltaCol;

						if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
							break;
						}

						if (board[newRow][newCol] === player) {
							consecutiveCount++;
						} else if (board[newRow][newCol] === null) {
							emptySpaces++;
							break;
						} else {
							break;
						}
					}
				}

				// Score based on potential
				if (consecutiveCount >= 2 && emptySpaces > 0) {
					score += consecutiveCount * 10;
				} else if (consecutiveCount >= 1 && emptySpaces >= 2) {
					score += consecutiveCount * 3;
				}
			}

			// Bonus for center columns
			if (col === 2) score += 5;
			else if (col === 1 || col === 3) score += 3;

			return score;
		},
		[]
	);

	// Get all valid moves
	const getValidMoves = useCallback((board: Board): number[] => {
		const validMoves: number[] = [];
		for (let col = 0; col < COLS; col++) {
			if (board[0][col] === null) {
				validMoves.push(col);
			}
		}
		return validMoves;
	}, []);

	// Evaluate all possible moves
	const evaluateAllMoves = useCallback(
		(board: Board, aiPlayer: Player, opponent: Player): MoveEvaluation[] => {
			const validMoves = getValidMoves(board);
			const evaluations: MoveEvaluation[] = [];

			for (const col of validMoves) {
				let score = 0;
				let moveType: MoveEvaluation['moveType'] = 'strategic';

				// Check if this move wins the game
				if (checkWinningMove(board, col, aiPlayer)) {
					score = 1000;
					moveType = 'win';
				}
				// Check if this move blocks opponent from winning
				else if (checkWinningMove(board, col, opponent)) {
					score = 500;
					moveType = 'block';
				}
				// Evaluate strategic value
				else {
					const row = findLowestEmptyRow(board, col);
					if (row !== -1) {
						score = evaluatePosition(board, row, col, aiPlayer);

						// Subtract points if this move sets up opponent
						const tempBoard = board.map((r) => [...r]);
						tempBoard[row][col] = aiPlayer;

						// Check if opponent could win on next move
						for (let opponentCol = 0; opponentCol < COLS; opponentCol++) {
							if (checkWinningMove(tempBoard, opponentCol, opponent)) {
								score -= 200;
								break;
							}
						}
					}
				}

				evaluations.push({ column: col, score, moveType });
			}

			return evaluations.sort((a, b) => b.score - a.score);
		},
		[checkWinningMove, findLowestEmptyRow, evaluatePosition, getValidMoves]
	);

	// Make AI move based on difficulty
	const makeAIMove = useCallback(
		(
			board: Board,
			difficulty: DifficultyLevel = 'medium'
		): Promise<AIMove | null> => {
			return new Promise((resolve) => {
				// Simulate thinking time
				const thinkingTime =
					difficulty === 'easy' ? 500 : difficulty === 'medium' ? 1000 : 1500;

				setTimeout(() => {
					const aiPlayer: Player = 'red';
					const opponent: Player = 'yellow';

					const evaluations = evaluateAllMoves(board, aiPlayer, opponent);

					if (evaluations.length === 0) {
						resolve(null);
						return;
					}

					let selectedMove: MoveEvaluation;

					switch (difficulty) {
						case 'easy':
							// Choose randomly from top 3 moves, with bias toward worse moves
							const topMoves = evaluations.slice(
								0,
								Math.min(3, evaluations.length)
							);
							const weights = [0.4, 0.35, 0.25]; // Favor worse moves slightly
							const randomValue = Math.random();
							let cumulativeWeight = 0;

							selectedMove = topMoves[0];
							for (let i = 0; i < topMoves.length; i++) {
								cumulativeWeight += weights[i] || 0.1;
								if (randomValue <= cumulativeWeight) {
									selectedMove = topMoves[i];
									break;
								}
							}
							break;

						case 'medium':
							// Choose best move 70% of the time, second best 30%
							if (Math.random() < 0.7 || evaluations.length === 1) {
								selectedMove = evaluations[0];
							} else {
								selectedMove = evaluations[1] || evaluations[0];
							}
							break;

						case 'hard':
							// Always choose the best move
							selectedMove = evaluations[0];
							break;

						default:
							selectedMove = evaluations[0];
					}

					const aiMove: AIMove = {
						column: selectedMove.column,
						confidence: Math.min(100, selectedMove.score / 10 + 50),
						moveType: selectedMove.moveType,
						predictedAdvantage: selectedMove.score,
					};

					resolve(aiMove);
				}, thinkingTime);
			});
		},
		[evaluateAllMoves]
	);

	return {
		makeAIMove,
		evaluateAllMoves,
		getValidMoves,
	};
};

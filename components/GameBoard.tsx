import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GameCell } from './GameCell';
import { Board, WinCondition, KingConversion } from '@/interfaces/game';

interface GameBoardProps {
	board: Board;
	winCondition: WinCondition | null;
	onColumnPress: (col: number) => void;
	isAnimating: boolean;
	kingConversions?: KingConversion[];
}

const { width } = Dimensions.get('window');
const BOARD_PADDING = 20;
const CELL_MARGIN = 3;
const BOARD_WIDTH = width - BOARD_PADDING * 2;
const AVAILABLE_WIDTH = BOARD_WIDTH - 32; // Account for board padding
const CELL_SIZE = Math.min(
	(AVAILABLE_WIDTH - CELL_MARGIN * 4 * 2) / 5, // 5 columns
	60 // Maximum cell size
);

export const GameBoard: React.FC<GameBoardProps> = ({
	board,
	winCondition,
	onColumnPress,
	isAnimating,
	kingConversions = [],
}) => {
	const isWinningCell = (row: number, col: number): boolean => {
		if (!winCondition) return false;
		return winCondition.positions.some(
			([winRow, winCol]) => winRow === row && winCol === col
		);
	};

	const isConvertingCell = (row: number, col: number): boolean => {
		return kingConversions.some((conversion) =>
			conversion.positions.some(
				([convRow, convCol]) => convRow === row && convCol === col
			)
		);
	};

	return (
		<View style={styles.boardContainer}>
			<View style={styles.board}>
				{board.map((row, rowIndex) => (
					<View key={rowIndex} style={styles.row}>
						{row.map((cell, colIndex) => (
							<GameCell
								key={`${rowIndex}-${colIndex}`}
								cell={cell}
								size={CELL_SIZE}
								onPress={() => onColumnPress(colIndex)}
								isWinning={isWinningCell(rowIndex, colIndex)}
								disabled={isAnimating}
								isConverting={isConvertingCell(rowIndex, colIndex)}
							/>
						))}
					</View>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	boardContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	board: {
		backgroundColor: '#2563eb',
		borderRadius: 20,
		padding: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.3,
		shadowRadius: 10,
		elevation: 15,
		maxWidth: BOARD_WIDTH,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 2,
	},
});

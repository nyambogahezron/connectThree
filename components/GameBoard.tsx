import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GameCell } from './GameCell';
import { Board, WinCondition } from '@/types/game';

interface GameBoardProps {
  board: Board;
  winCondition: WinCondition | null;
  onColumnPress: (col: number) => void;
  isAnimating: boolean;
}

const { width } = Dimensions.get('window');
const BOARD_PADDING = 20;
const CELL_MARGIN = 4;
const BOARD_WIDTH = width - (BOARD_PADDING * 2);
const CELL_SIZE = (BOARD_WIDTH - (CELL_MARGIN * 4 * 2)) / 5;

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  winCondition,
  onColumnPress,
  isAnimating,
}) => {
  const isWinningCell = (row: number, col: number): boolean => {
    if (!winCondition) return false;
    return winCondition.positions.some(([winRow, winCol]) => 
      winRow === row && winCol === col
    );
  };

  return (
    <View style={styles.board}>
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <GameCell
              key={`${rowIndex}-${colIndex}`}
              player={cell}
              size={CELL_SIZE}
              onPress={() => onColumnPress(colIndex)}
              isWinning={isWinningCell(rowIndex, colIndex)}
              disabled={isAnimating}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CELL_MARGIN,
  },
});
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Player } from '@/types/game';
import * as Haptics from 'expo-haptics';

interface GameCellProps {
  player: Player | null;
  size: number;
  onPress: () => void;
  isWinning: boolean;
  disabled: boolean;
}

export const GameCell: React.FC<GameCellProps> = ({
  player,
  size,
  onPress,
  isWinning,
  disabled,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isWinning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isWinning, pulseAnim]);

  const handlePress = () => {
    if (disabled) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const getPlayerColor = () => {
    switch (player) {
      case 'red':
        return '#ef4444';
      case 'yellow':
        return '#fbbf24';
      default:
        return '#ffffff';
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.cell,
          {
            width: size,
            height: size,
            backgroundColor: getPlayerColor(),
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
          isWinning && styles.winningCell,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderRadius: 50,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  winningCell: {
    shadowColor: '#fbbf24',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
});
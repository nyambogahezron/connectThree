import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Player } from '@/types/game';

interface PlayerIndicatorProps {
  currentPlayer: Player;
  isAnimating: boolean;
  displayName?: string;
}

export const PlayerIndicator: React.FC<PlayerIndicatorProps> = ({
  currentPlayer,
  isAnimating,
  displayName,
}) => {
  const getDisplayName = () => {
    if (displayName) return displayName;
    return currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Player</Text>
      <View style={styles.playerContainer}>
        <View
          style={[
            styles.playerDisc,
            {
              backgroundColor: currentPlayer === 'red' ? '#ef4444' : '#fbbf24',
              opacity: isAnimating ? 0.5 : 1,
            },
          ]}
        />
        <Text style={[styles.playerText, { opacity: isAnimating ? 0.5 : 1 }]}>
          {getDisplayName()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  playerDisc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  playerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
});
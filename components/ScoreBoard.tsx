import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameStats } from '@/types/game';

interface ScoreBoardProps {
  stats: GameStats;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Score Board</Text>
      <View style={styles.scoresContainer}>
        <View style={styles.scoreItem}>
          <View style={[styles.playerDisc, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.scoreText}>Red: {stats.redWins}</Text>
        </View>
        <View style={styles.scoreItem}>
          <View style={[styles.playerDisc, { backgroundColor: '#fbbf24' }]} />
          <Text style={styles.scoreText}>Yellow: {stats.yellowWins}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreText}>Draws: {stats.draws}</Text>
        </View>
      </View>
      <Text style={styles.totalGames}>Total Games: {stats.totalGames}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Orbitron-Bold',
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerDisc: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Orbitron-Regular',
  },
  totalGames: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Orbitron-Regular',
  },
});
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Trophy, Medal, Users } from 'lucide-react-native';

export default function LeaderboardScreen() {
  const mockStats = [
    { rank: 1, name: 'Red Player', wins: 15, games: 20, winRate: 75 },
    { rank: 2, name: 'Yellow Player', wins: 12, games: 18, winRate: 67 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#fbbf24" />;
      case 2:
        return <Medal size={24} color="#9ca3af" />;
      default:
        return <Users size={24} color="#6b7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
          <Text style={styles.subtitle}>Top Players</Text>
        </View>

        <View style={styles.leaderboardContainer}>
          {mockStats.map((player) => (
            <View key={player.rank} style={styles.playerCard}>
              <View style={styles.rankContainer}>
                {getRankIcon(player.rank)}
                <Text style={styles.rankText}>#{player.rank}</Text>
              </View>
              
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerStats}>
                  {player.wins} wins • {player.games} games
                </Text>
              </View>

              <View style={styles.winRateContainer}>
                <Text style={styles.winRate}>{player.winRate}%</Text>
                <Text style={styles.winRateLabel}>Win Rate</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How to Play</Text>
          <View style={styles.rulesList}>
            <Text style={styles.rule}>• Drop discs into columns</Text>
            <Text style={styles.rule}>• Get 3 in a row to win</Text>
            <Text style={styles.rule}>• Horizontal, vertical, or diagonal</Text>
            <Text style={styles.rule}>• First to connect 3 wins!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -1,
    fontFamily: 'Orbitron-Black',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Orbitron-Regular',
  },
  leaderboardContainer: {
    marginBottom: 30,
  },
  playerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
    fontFamily: 'Orbitron-Bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Orbitron-Bold',
  },
  playerStats: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'Orbitron-Regular',
  },
  winRateContainer: {
    alignItems: 'center',
  },
  winRate: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
    fontFamily: 'Orbitron-Black',
  },
  winRateLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'Orbitron-Regular',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Orbitron-Bold',
  },
  rulesList: {
    gap: 8,
  },
  rule: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 24,
    fontFamily: 'Orbitron-Regular',
  },
});
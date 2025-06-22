import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LeaderboardDisplay } from '@/components/LeaderboardDisplay';
import { DatabaseService } from '@/lib/services/database';
import { usePlayerManager } from '@/hooks/usePlayerManager';
import { Trophy, ChartBar as BarChart3, Users, Settings, Plus } from 'lucide-react-native';

export default function LeaderboardScreen() {
  const { currentPlayer, createPlayer, allPlayers } = usePlayerManager();
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [showCreatePlayer, setShowCreatePlayer] = useState(false);

  useEffect(() => {
    const loadPlayerStats = async () => {
      if (currentPlayer) {
        const stats = await DatabaseService.getPlayerStats(currentPlayer.id);
        setPlayerStats(stats);
      }
    };

    loadPlayerStats();
  }, [currentPlayer]);

  const handleCreatePlayer = async () => {
    try {
      const playerName = `Player ${allPlayers.length + 1}`;
      await createPlayer(playerName);
      setShowCreatePlayer(false);
    } catch (error) {
      console.error('Failed to create player:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Trophy size={32} color="#fbbf24" />
          <Text style={styles.title}>Leaderboards</Text>
          <Text style={styles.subtitle}>Compete with the best players</Text>
        </View>

        {/* Player Quick Stats */}
        {currentPlayer && playerStats && (
          <View style={styles.playerStatsCard}>
            <View style={styles.playerStatsHeader}>
              <Users size={20} color="#4f46e5" />
              <Text style={styles.playerStatsTitle}>Your Stats</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{playerStats.totalGamesPlayed}</Text>
                <Text style={styles.statLabel}>Games</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{playerStats.totalWins}</Text>
                <Text style={styles.statLabel}>Wins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {playerStats.totalGamesPlayed > 0 
                    ? `${((playerStats.totalWins / playerStats.totalGamesPlayed) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{playerStats.currentWinStreak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>

            <View style={styles.rankInfo}>
              <BarChart3 size={16} color="#059669" />
              <Text style={styles.rankText}>
                Global Rank: #{playerStats.globalRank || 'Unranked'}
              </Text>
            </View>
          </View>
        )}

        {/* Main Leaderboard */}
        <LeaderboardDisplay
          category="global"
          limit={20}
          currentPlayerId={currentPlayer?.id}
        />

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreatePlayer}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Add Player</Text>
          </TouchableOpacity>
        </View>

        {/* Game Rules */}
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>Scoring System</Text>
          <View style={styles.rulesList}>
            <Text style={styles.rule}>• 3-match: 100 points</Text>
            <Text style={styles.rule}>• 4-match: 200 points</Text>
            <Text style={styles.rule}>• 5+ match: 300 points</Text>
            <Text style={styles.rule}>• King matches: 2x multiplier</Text>
            <Text style={styles.rule}>• Cascades: 1.5x, 2x, 3x multiplier</Text>
            <Text style={styles.rule}>• Achievements: Bonus points</Text>
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
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 12,
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
  playerStatsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  playerStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerStatsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
    fontFamily: 'Orbitron-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    fontFamily: 'Orbitron-Black',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Orbitron-Regular',
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 6,
    fontFamily: 'Orbitron-Bold',
  },
  actionsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#4f46e5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'Orbitron-Bold',
  },
  rulesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
  rulesTitle: {
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
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 20,
    fontFamily: 'Orbitron-Regular',
  },
});
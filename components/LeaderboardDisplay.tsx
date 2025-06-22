import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { DatabaseService } from '@/lib/services/database';
import { Trophy, Medal, Crown, Users, TrendingUp, Gamepad2 } from 'lucide-react-native';

interface LeaderboardEntry {
  rank: number;
  player: {
    id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  gamesPlayed: number;
  winRate: number;
}

interface LeaderboardDisplayProps {
  category?: 'global' | 'connect3' | 'classic';
  limit?: number;
  currentPlayerId?: string;
}

export const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({
  category = 'global',
  limit = 20,
  currentPlayerId,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLeaderboard = async (cat: string) => {
    try {
      setIsLoading(true);
      const data = await DatabaseService.getLeaderboard(cat, limit);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await DatabaseService.updateLeaderboards();
    await loadLeaderboard(selectedCategory);
    setIsRefreshing(false);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    loadLeaderboard(cat);
  };

  useEffect(() => {
    loadLeaderboard(selectedCategory);
  }, [selectedCategory, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#fbbf24" />;
      case 2:
        return <Medal size={24} color="#9ca3af" />;
      case 3:
        return <Medal size={24} color="#cd7f32" />;
      default:
        return <Text style={styles.rankNumber}>#{rank}</Text>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'global':
        return <Trophy size={20} color="#4f46e5" />;
      case 'connect3':
        return <Gamepad2 size={20} color="#059669" />;
      case 'classic':
        return <Crown size={20} color="#dc2626" />;
      default:
        return <Users size={20} color="#6b7280" />;
    }
  };

  const formatScore = (score: number): string => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  };

  const formatWinRate = (winRate: number): string => {
    return `${(winRate * 100).toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      {/* Category Selector */}
      <View style={styles.categorySelector}>
        {['global', 'connect3', 'classic'].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.selectedCategory,
            ]}
            onPress={() => handleCategoryChange(cat)}
          >
            {getCategoryIcon(cat)}
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.selectedCategoryText,
            ]}>
              {cat === 'global' ? 'Global' : cat === 'connect3' ? 'Connect 3' : 'Classic'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TrendingUp size={24} color="#4f46e5" />
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        style={styles.leaderboardList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Trophy size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No players yet</Text>
            <Text style={styles.emptySubtext}>Be the first to play and claim the top spot!</Text>
          </View>
        ) : (
          leaderboard.map((entry, index) => (
            <View
              key={`${entry.player.id}-${index}`}
              style={[
                styles.leaderboardItem,
                entry.player.id === currentPlayerId && styles.currentPlayerItem,
                entry.rank <= 3 && styles.topThreeItem,
              ]}
            >
              {/* Rank */}
              <View style={styles.rankContainer}>
                {getRankIcon(entry.rank)}
              </View>

              {/* Player Info */}
              <View style={styles.playerInfo}>
                <Text style={[
                  styles.playerName,
                  entry.player.id === currentPlayerId && styles.currentPlayerName,
                ]}>
                  {entry.player.name}
                  {entry.player.id === currentPlayerId && ' (You)'}
                </Text>
                <Text style={styles.playerStats}>
                  {entry.gamesPlayed} games • {formatWinRate(entry.winRate)} win rate
                </Text>
              </View>

              {/* Score */}
              <View style={styles.scoreContainer}>
                <Text style={[
                  styles.scoreText,
                  entry.rank <= 3 && styles.topThreeScore,
                ]}>
                  {formatScore(entry.score)}
                </Text>
                <Text style={styles.scoreLabel}>points</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Rankings update after each game • Pull to refresh
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedCategory: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
    fontFamily: 'Orbitron-Regular',
  },
  selectedCategoryText: {
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1f2937',
    marginLeft: 12,
    fontFamily: 'Orbitron-Black',
  },
  leaderboardList: {
    maxHeight: 400,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Orbitron-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    fontFamily: 'Orbitron-Bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Orbitron-Regular',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currentPlayerItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  topThreeItem: {
    backgroundColor: '#fefce8',
    borderColor: '#fbbf24',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    fontFamily: 'Orbitron-Bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: 'Orbitron-Bold',
  },
  currentPlayerName: {
    color: '#3b82f6',
  },
  playerStats: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Orbitron-Regular',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
    fontFamily: 'Orbitron-Black',
  },
  topThreeScore: {
    color: '#f59e0b',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'Orbitron-Regular',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'Orbitron-Regular',
  },
});
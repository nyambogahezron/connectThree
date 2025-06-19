import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { GameBoard } from '@/components/GameBoard';
import { PlayerIndicator } from '@/components/PlayerIndicator';
import { ScoreBoard } from '@/components/ScoreBoard';
import { GameModal } from '@/components/GameModal';
import { GameModeSelector } from '@/components/GameModeSelector';
import { GameVariantSelector } from '@/components/GameVariantSelector';
import { KingCounter } from '@/components/KingCounter';
import { AIThinkingIndicator } from '@/components/AIThinkingIndicator';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameStats } from '@/hooks/useGameStats';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { RotateCcw, Settings as SettingsIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function GameScreen() {
  const {
    board,
    currentPlayer,
    gameState,
    winCondition,
    isAnimating,
    gameMode,
    gameVariant,
    kingConversions,
    makeMove,
    resetGame,
    isColumnFull,
    setGameMode,
    setGameVariant,
    getKingCounts,
    getPlayerFromCell,
  } = useGameLogic();

  const { stats, updateStats, resetStats } = useGameStats();
  const { makeAIMove } = useAIOpponent();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    if (gameState === 'won' && winCondition) {
      updateStats(winCondition.player, gameVariant);
    } else if (gameState === 'draw') {
      updateStats('draw', gameVariant);
    }
  }, [gameState, winCondition, updateStats, gameVariant]);

  // Handle AI moves
  useEffect(() => {
    const handleAIMove = async () => {
      if (
        gameMode.type === 'ai' &&
        currentPlayer === 'red' &&
        gameState === 'playing' &&
        !isAnimating
      ) {
        setIsAIThinking(true);
        
        try {
          // Convert board for AI (treat kings as regular pieces for AI logic)
          const aiBoard = board.map(row => 
            row.map(cell => getPlayerFromCell(cell))
          );
          
          const aiMove = await makeAIMove(aiBoard, gameMode.aiDifficulty);
          if (aiMove) {
            await makeMove(aiMove.column);
          }
        } catch (error) {
          console.error('AI move failed:', error);
        } finally {
          setIsAIThinking(false);
        }
      }
    };

    // Small delay to ensure UI updates
    const timer = setTimeout(handleAIMove, 100);
    return () => clearTimeout(timer);
  }, [gameMode, currentPlayer, gameState, isAnimating, board, makeAIMove, makeMove, getPlayerFromCell]);

  const handleColumnPress = async (col: number) => {
    // Prevent human moves during AI turn or when AI is thinking
    if (gameMode.type === 'ai' && (currentPlayer === 'red' || isAIThinking)) {
      return;
    }

    if (isColumnFull(col)) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    const success = await makeMove(col);
    if (success && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
  };

  const handleResetGame = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetGame();
  };

  const handleResetStats = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetStats();
  };

  const getCurrentPlayerDisplay = () => {
    if (gameMode.type === 'ai') {
      return currentPlayer === 'red' ? 'AI' : 'You';
    }
    return currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
  };

  const getGameTitle = () => {
    return gameVariant === 'classic' ? 'Classic Board' : 'Connect 3';
  };

  const getGameSubtitle = () => {
    return gameVariant === 'classic' 
      ? 'Match 3 to create Kings, then match 3 Kings to win!'
      : 'Get 3 in a row to win!';
  };

  const kingCounts = getKingCounts();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{getGameTitle()}</Text>
          <Text style={styles.subtitle}>{getGameSubtitle()}</Text>
          
          <View style={styles.selectorButtons}>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowVariantSelector(!showVariantSelector)}
              activeOpacity={0.8}
            >
              <SettingsIcon size={16} color="#4f46e5" />
              <Text style={styles.selectorButtonText}>
                {gameVariant === 'classic' ? 'Classic Board' : 'Connect 3'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowModeSelector(!showModeSelector)}
              activeOpacity={0.8}
            >
              <SettingsIcon size={16} color="#4f46e5" />
              <Text style={styles.selectorButtonText}>
                {gameMode.type === 'pvp' ? 'Player vs Player' : `vs AI (${gameMode.aiDifficulty})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showVariantSelector && (
          <GameVariantSelector
            currentVariant={gameVariant}
            onVariantChange={(variant) => {
              setGameVariant(variant);
              setShowVariantSelector(false);
            }}
          />
        )}

        {showModeSelector && (
          <GameModeSelector
            currentMode={gameMode}
            onModeChange={(mode) => {
              setGameMode(mode);
              setShowModeSelector(false);
            }}
          />
        )}

        <ScoreBoard stats={stats} gameVariant={gameVariant} />

        {gameVariant === 'classic' && (
          <KingCounter 
            redKings={kingCounts.red} 
            yellowKings={kingCounts.yellow} 
          />
        )}

        <PlayerIndicator 
          currentPlayer={gameMode.type === 'ai' && currentPlayer === 'red' ? 'red' : currentPlayer}
          isAnimating={isAnimating || isAIThinking}
          displayName={getCurrentPlayerDisplay()}
        />

        <AIThinkingIndicator 
          visible={isAIThinking} 
          difficulty={gameMode.aiDifficulty}
        />

        <GameBoard
          board={board}
          winCondition={winCondition}
          onColumnPress={handleColumnPress}
          isAnimating={isAnimating || isAIThinking}
          kingConversions={kingConversions}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetGame}
            activeOpacity={0.8}
          >
            <RotateCcw size={20} color="#ffffff" />
            <Text style={styles.resetButtonText}>Reset Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearStatsButton}
            onPress={handleResetStats}
            activeOpacity={0.8}
          >
            <Text style={styles.clearStatsButtonText}>Clear Stats</Text>
          </TouchableOpacity>
        </View>

        <GameModal
          visible={gameState !== 'playing'}
          gameState={gameState}
          winner={winCondition?.player || null}
          gameMode={gameMode}
          winType={winCondition?.type}
          onPlayAgain={handlePlayAgain}
          onClose={handlePlayAgain}
        />
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
    marginBottom: 20,
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
    marginBottom: 12,
    fontFamily: 'Orbitron-Regular',
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
    marginLeft: 6,
    fontFamily: 'Orbitron-Regular',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  resetButton: {
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
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'Orbitron-Bold',
  },
  clearStatsButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  clearStatsButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Orbitron-Regular',
  },
});
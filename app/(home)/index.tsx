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
import { PersistentScoreDisplay } from '@/components/PersistentScoreDisplay';
import { ScoreAnimation } from '@/components/ScoreAnimation';
import { AchievementNotification } from '@/components/AchievementNotification';
import { ScoreEventFeed } from '@/components/ScoreEventFeed';
import { GameModal } from '@/components/GameModal';
import { GameModeSelector } from '@/components/GameModeSelector';
import { GameVariantSelector } from '@/components/GameVariantSelector';
import { KingCounter } from '@/components/KingCounter';
import { AIThinkingIndicator } from '@/components/AIThinkingIndicator';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameStats } from '@/hooks/useGameStats';
import { usePersistentScoring } from '@/hooks/usePersistentScoring';
import { usePlayerManager } from '@/hooks/usePlayerManager';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { RotateCcw, Settings as SettingsIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function GameScreen() {
  const { currentPlayer, getOrCreateDefaultPlayer } = usePlayerManager();
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  
  const {
    board,
    currentPlayer: gameCurrentPlayer,
    gameState,
    winCondition,
    isAnimating,
    gameMode,
    gameVariant,
    kingConversions,
    cascadeLevel,
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
  
  // Initialize persistent scoring
  const persistentScoring = usePersistentScoring({
    gameVariant,
    gameMode: gameMode.type,
    aiDifficulty: gameMode.aiDifficulty,
    playerId: currentPlayer?.id || 'temp',
    playerColor: 'yellow', // Human player is always yellow
  });

  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  // Initialize player if needed
  useEffect(() => {
    const initPlayer = async () => {
      if (!currentPlayer) {
        await getOrCreateDefaultPlayer();
      }
    };
    initPlayer();
  }, [currentPlayer, getOrCreateDefaultPlayer]);

  // Handle game completion
  useEffect(() => {
    if (gameState === 'won' && winCondition) {
      updateStats(winCondition.player, gameVariant);
      
      // Complete persistent scoring session
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      const kingCounts = getKingCounts();
      
      persistentScoring.completeSession(
        winCondition.player === 'yellow' ? currentPlayer?.id || null : (gameMode.type === 'ai' ? 'ai' : 'opponent'),
        winCondition.type,
        duration,
        kingCounts.red + kingCounts.yellow,
        cascadeLevel,
        false // TODO: Calculate perfect game
      );
      
      // Check for ultimate victory achievement
      if (winCondition.type === 'king') {
        persistentScoring.awardAchievement(
          'ultimate_victory',
          'Ultimate Champion',
          'Win with 3 matching kings',
          1500
        );
      }
    } else if (gameState === 'draw') {
      updateStats('draw', gameVariant);
      
      const duration = Math.floor((Date.now() - gameStartTime) / 1000);
      persistentScoring.completeSession(null, 'timeout', duration);
    }
  }, [gameState, winCondition, updateStats, gameVariant, persistentScoring, gameStartTime, currentPlayer, gameMode, cascadeLevel, getKingCounts]);

  // Handle AI moves
  useEffect(() => {
    const handleAIMove = async () => {
      if (
        gameMode.type === 'ai' &&
        gameCurrentPlayer === 'red' &&
        gameState === 'playing' &&
        !isAnimating
      ) {
        setIsAIThinking(true);
        
        try {
          const aiBoard = board.map(row => 
            row.map(cell => getPlayerFromCell(cell))
          );
          
          const aiMove = await makeAIMove(aiBoard, gameMode.aiDifficulty);
          if (aiMove) {
            await makeMove(aiMove.column, handleMatchFound);
          }
        } catch (error) {
          console.error('AI move failed:', error);
        } finally {
          setIsAIThinking(false);
        }
      }
    };

    const timer = setTimeout(handleAIMove, 100);
    return () => clearTimeout(timer);
  }, [gameMode, gameCurrentPlayer, gameState, isAnimating, board, makeAIMove, makeMove, getPlayerFromCell]);

  // Handle match found callback for scoring
  const handleMatchFound = (matchSize: number, cascadeLevel: number, isKing: boolean, simultaneousMatches: number) => {
    // Award points for the match
    persistentScoring.awardMatchPoints(matchSize, cascadeLevel, simultaneousMatches, isKing);
    
    // Check for achievements
    const kingCounts = getKingCounts();
    
    // First match achievement
    if (persistentScoring.gameScore.totalMatches === 0) {
      persistentScoring.awardAchievement(
        'first_match',
        'First Blood',
        'Make your first match',
        50
      );
    }
    
    // Cascade master achievement
    if (cascadeLevel >= 5) {
      persistentScoring.awardAchievement(
        'cascade_master',
        'Cascade Master',
        'Achieve 5+ cascades in a single turn',
        1000
      );
    }
    
    // King maker achievement (Classic mode)
    if (gameVariant === 'classic' && kingCounts.red + kingCounts.yellow >= 5) {
      persistentScoring.awardAchievement(
        'king_maker',
        'King Maker',
        'Create 5 kings in Classic mode',
        750
      );
    }
    
    // Combo master achievement
    if (simultaneousMatches >= 3) {
      persistentScoring.awardAchievement(
        'combo_master',
        'Combo Master',
        'Trigger 3 simultaneous matches',
        800
      );
    }
  };

  const handleColumnPress = async (col: number) => {
    // Prevent human moves during AI turn or when AI is thinking
    if (gameMode.type === 'ai' && (gameCurrentPlayer === 'red' || isAIThinking)) {
      return;
    }

    if (isColumnFull(col)) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    persistentScoring.incrementMoves();
    const success = await makeMove(col, handleMatchFound);
    if (success && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    persistentScoring.resetSession();
    setGameStartTime(Date.now());
  };

  const handleResetGame = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetGame();
    persistentScoring.resetSession();
    setGameStartTime(Date.now());
  };

  const handleResetStats = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetStats();
  };

  const getCurrentPlayerDisplay = () => {
    if (gameMode.type === 'ai') {
      return gameCurrentPlayer === 'red' ? 'AI' : 'You';
    }
    return gameCurrentPlayer.charAt(0).toUpperCase() + gameCurrentPlayer.slice(1);
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

  if (!currentPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing player...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              persistentScoring.resetSession();
              setGameStartTime(Date.now());
            }}
          />
        )}

        {showModeSelector && (
          <GameModeSelector
            currentMode={gameMode}
            onModeChange={(mode) => {
              setGameMode(mode);
              setShowModeSelector(false);
              persistentScoring.resetSession();
              setGameStartTime(Date.now());
            }}
          />
        )}

        <PersistentScoreDisplay 
          gameScore={persistentScoring.gameScore} 
          showLifetimeStats={true}
          showMultiplier={true}
        />
        
        <ScoreBoard stats={stats} gameVariant={gameVariant} />

        {persistentScoring.gameScore.scoreEvents.length > 0 && (
          <ScoreEventFeed events={persistentScoring.gameScore.scoreEvents} />
        )}

        {gameVariant === 'classic' && (
          <KingCounter 
            redKings={kingCounts.red} 
            yellowKings={kingCounts.yellow} 
          />
        )}

        <PlayerIndicator 
          currentPlayer={gameMode.type === 'ai' && gameCurrentPlayer === 'red' ? 'red' : gameCurrentPlayer}
          isAnimating={isAnimating || isAIThinking}
          displayName={getCurrentPlayerDisplay()}
        />

        <AIThinkingIndicator 
          visible={isAIThinking} 
          difficulty={gameMode.aiDifficulty}
        />

        <View style={styles.gameContainer}>
          <GameBoard
            board={board}
            winCondition={winCondition}
            onColumnPress={handleColumnPress}
            isAnimating={isAnimating || isAIThinking}
            kingConversions={kingConversions}
          />
          
          {/* Score Animations Overlay */}
          {persistentScoring.scoreAnimations.map((animation) => (
            <ScoreAnimation
              key={animation.id}
              animation={animation}
              onComplete={(id) => {
                // Animation cleanup is handled in usePersistentScoring hook
              }}
            />
          ))}
        </View>

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
            <Text style={styles.clearStatsButtonText}>Clear Session Stats</Text>
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

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={newAchievement}
        visible={!!newAchievement}
        onHide={() => setNewAchievement(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Orbitron-Regular',
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
  gameContainer: {
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
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
import { useState, useCallback } from 'react';
import { GameStats, Player } from '@/types/game';

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>({
    redWins: 0,
    yellowWins: 0,
    draws: 0,
    totalGames: 0,
  });

  const updateStats = useCallback((result: 'red' | 'yellow' | 'draw') => {
    setStats(prev => ({
      ...prev,
      redWins: result === 'red' ? prev.redWins + 1 : prev.redWins,
      yellowWins: result === 'yellow' ? prev.yellowWins + 1 : prev.yellowWins,
      draws: result === 'draw' ? prev.draws + 1 : prev.draws,
      totalGames: prev.totalGames + 1,
    }));
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      redWins: 0,
      yellowWins: 0,
      draws: 0,
      totalGames: 0,
    });
  }, []);

  return {
    stats,
    updateStats,
    resetStats,
  };
};
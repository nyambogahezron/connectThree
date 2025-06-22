import { useState, useCallback, useEffect } from 'react';
import { DatabaseService } from '@/lib/services/database';
import { Player } from '@/lib/database/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENT_PLAYER_KEY = 'current_player_id';

export const usePlayerManager = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current player from storage
  const loadCurrentPlayer = useCallback(async () => {
    try {
      const playerId = await AsyncStorage.getItem(CURRENT_PLAYER_KEY);
      if (playerId) {
        const player = await DatabaseService.getPlayer(playerId);
        if (player) {
          setCurrentPlayer(player);
        } else {
          // Player not found, clear storage
          await AsyncStorage.removeItem(CURRENT_PLAYER_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load current player:', error);
    }
  }, []);

  // Load all players
  const loadAllPlayers = useCallback(async () => {
    try {
      const players = await DatabaseService.getAllPlayers();
      setAllPlayers(players);
    } catch (error) {
      console.error('Failed to load players:', error);
    }
  }, []);

  // Create new player
  const createPlayer = useCallback(async (name: string, avatar?: string): Promise<Player> => {
    try {
      const player = await DatabaseService.createPlayer(name, avatar);
      setAllPlayers(prev => [...prev, player]);
      return player;
    } catch (error) {
      console.error('Failed to create player:', error);
      throw error;
    }
  }, []);

  // Set current player
  const setCurrentPlayerById = useCallback(async (playerId: string) => {
    try {
      const player = await DatabaseService.getPlayer(playerId);
      if (player) {
        setCurrentPlayer(player);
        await AsyncStorage.setItem(CURRENT_PLAYER_KEY, playerId);
      }
    } catch (error) {
      console.error('Failed to set current player:', error);
    }
  }, []);

  // Update player
  const updatePlayer = useCallback(async (playerId: string, updates: Partial<Pick<Player, 'name' | 'avatar'>>) => {
    try {
      const updatedPlayer = await DatabaseService.updatePlayer(playerId, updates);
      if (updatedPlayer) {
        setAllPlayers(prev => prev.map(p => p.id === playerId ? updatedPlayer : p));
        if (currentPlayer?.id === playerId) {
          setCurrentPlayer(updatedPlayer);
        }
      }
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  }, [currentPlayer]);

  // Get or create default player
  const getOrCreateDefaultPlayer = useCallback(async (): Promise<Player> => {
    if (currentPlayer) {
      return currentPlayer;
    }

    // Check if we have any players
    if (allPlayers.length === 0) {
      // Create default player
      const defaultPlayer = await createPlayer('Player 1');
      await setCurrentPlayerById(defaultPlayer.id);
      return defaultPlayer;
    }

    // Use first available player
    const firstPlayer = allPlayers[0];
    await setCurrentPlayerById(firstPlayer.id);
    return firstPlayer;
  }, [currentPlayer, allPlayers, createPlayer, setCurrentPlayerById]);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadAllPlayers();
      await loadCurrentPlayer();
      setIsLoading(false);
    };

    initialize();
  }, [loadAllPlayers, loadCurrentPlayer]);

  return {
    currentPlayer,
    allPlayers,
    isLoading,
    createPlayer,
    setCurrentPlayerById,
    updatePlayer,
    getOrCreateDefaultPlayer,
    refreshPlayers: loadAllPlayers,
  };
};
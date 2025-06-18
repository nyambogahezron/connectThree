import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Bot, Users } from 'lucide-react-native';
import { GameMode } from '@/hooks/useGameLogic';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const modes = [
    {
      type: 'pvp' as const,
      title: 'Player vs Player',
      subtitle: 'Play with a friend',
      icon: Users,
    },
    {
      type: 'ai' as const,
      title: 'vs AI (Easy)',
      subtitle: 'Beginner friendly',
      icon: Bot,
      aiDifficulty: 'easy' as const,
    },
    {
      type: 'ai' as const,
      title: 'vs AI (Medium)',
      subtitle: 'Balanced challenge',
      icon: Bot,
      aiDifficulty: 'medium' as const,
    },
    {
      type: 'ai' as const,
      title: 'vs AI (Hard)',
      subtitle: 'Expert level',
      icon: Bot,
      aiDifficulty: 'hard' as const,
    },
  ];

  const isSelected = (mode: typeof modes[0]) => {
    if (mode.type === 'pvp') {
      return currentMode.type === 'pvp';
    }
    return currentMode.type === 'ai' && currentMode.aiDifficulty === mode.aiDifficulty;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Mode</Text>
      <View style={styles.modesContainer}>
        {modes.map((mode, index) => {
          const IconComponent = mode.icon;
          const selected = isSelected(mode);
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.modeButton, selected && styles.selectedMode]}
              onPress={() => onModeChange({
                type: mode.type,
                aiDifficulty: mode.aiDifficulty,
              })}
              activeOpacity={0.8}
            >
              <View style={styles.modeIcon}>
                <IconComponent 
                  size={24} 
                  color={selected ? '#ffffff' : '#4f46e5'} 
                />
              </View>
              <View style={styles.modeText}>
                <Text style={[styles.modeTitle, selected && styles.selectedText]}>
                  {mode.title}
                </Text>
                <Text style={[styles.modeSubtitle, selected && styles.selectedSubtext]}>
                  {mode.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Orbitron-Bold',
  },
  modesContainer: {
    gap: 8,
  },
  modeButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMode: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  modeIcon: {
    marginRight: 12,
  },
  modeText: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: 'Orbitron-Bold',
  },
  modeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'Orbitron-Regular',
  },
  selectedText: {
    color: '#ffffff',
  },
  selectedSubtext: {
    color: '#e0e7ff',
  },
});
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Achievement } from '@/types/scoring';
import { Trophy, Star } from 'lucide-react-native';

interface AchievementNotificationProps {
  achievement: Achievement;
  visible: boolean;
  onHide: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  visible,
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -300,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, slideAnim, scaleAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Trophy size={24} color="#fbbf24" />
        <Star size={16} color="#fbbf24" style={styles.starIcon} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Achievement Unlocked!</Text>
        <Text style={styles.name}>{achievement.name}</Text>
        <Text style={styles.description}>{achievement.description}</Text>
        <Text style={styles.points}>+{achievement.points} points</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#fbbf24',
    zIndex: 1000,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  starIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 2,
    fontFamily: 'Orbitron-Bold',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
    fontFamily: 'Orbitron-Bold',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'Orbitron-Regular',
  },
  points: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    fontFamily: 'Orbitron-Bold',
  },
});
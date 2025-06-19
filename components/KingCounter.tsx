import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';

interface KingCounterProps {
  redKings: number;
  yellowKings: number;
}

export const KingCounter: React.FC<KingCounterProps> = ({
  redKings,
  yellowKings,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>King Count</Text>
      <View style={styles.countersContainer}>
        <View style={styles.counterItem}>
          <View style={[styles.kingDisc, { backgroundColor: '#dc2626' }]}>
            <Crown size={16} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.counterText}>Red: {redKings}</Text>
        </View>
        <View style={styles.counterItem}>
          <View style={[styles.kingDisc, { backgroundColor: '#d97706' }]}>
            <Crown size={16} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.counterText}>Yellow: {yellowKings}</Text>
        </View>
      </View>
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
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Orbitron-Bold',
  },
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kingDisc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Orbitron-Bold',
  },
});
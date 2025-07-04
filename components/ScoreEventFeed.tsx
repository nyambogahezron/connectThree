import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScoreEvent } from '@/interfaces/scoring';
import { Zap, Trophy, Star, Plus } from 'lucide-react-native';

interface ScoreEventFeedProps {
	events: ScoreEvent[];
	maxEvents?: number;
}

export const ScoreEventFeed: React.FC<ScoreEventFeedProps> = ({
	events,
	maxEvents = 5,
}) => {
	const getEventIcon = (type: ScoreEvent['type']) => {
		switch (type) {
			case 'match':
				return <Zap size={16} color='#4f46e5' />;
			case 'cascade':
				return <Zap size={16} color='#ef4444' />;
			case 'achievement':
				return <Trophy size={16} color='#fbbf24' />;
			case 'bonus':
				return <Star size={16} color='#059669' />;
			default:
				return <Plus size={16} color='#6b7280' />;
		}
	};

	const getEventColor = (type: ScoreEvent['type']) => {
		switch (type) {
			case 'match':
				return '#4f46e5';
			case 'cascade':
				return '#ef4444';
			case 'achievement':
				return '#fbbf24';
			case 'bonus':
				return '#059669';
			default:
				return '#6b7280';
		}
	};

	const displayEvents = events.slice(0, maxEvents);

	if (displayEvents.length === 0) {
		return null;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Recent Scores</Text>
			<ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
				{displayEvents.map((event, index) => (
					<View key={`${event.timestamp}-${index}`} style={styles.eventItem}>
						<View style={styles.eventIcon}>{getEventIcon(event.type)}</View>
						<View style={styles.eventContent}>
							<Text style={styles.eventDescription}>{event.description}</Text>
							{event.multiplier > 1 && (
								<Text style={styles.eventMultiplier}>
									{event.multiplier.toFixed(1)}x multiplier
								</Text>
							)}
						</View>
						<Text
							style={[styles.eventPoints, { color: getEventColor(event.type) }]}
						>
							+{event.points}
						</Text>
					</View>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	title: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 12,
		textAlign: 'center',
		fontFamily: 'Orbitron-Bold',
	},
	eventList: {
		maxHeight: 150,
	},
	eventItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#f3f4f6',
	},
	eventIcon: {
		marginRight: 12,
	},
	eventContent: {
		flex: 1,
	},
	eventDescription: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		fontFamily: 'Orbitron-Regular',
	},
	eventMultiplier: {
		fontSize: 12,
		color: '#6b7280',
		fontStyle: 'italic',
		fontFamily: 'Orbitron-Regular',
	},
	eventPoints: {
		fontSize: 16,
		fontWeight: '700',
		fontFamily: 'Orbitron-Bold',
	},
});

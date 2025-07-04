import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameScore } from '@/interfaces/scoring';
import { Trophy, Zap, Target } from 'lucide-react-native';

interface ScoreDisplayProps {
	gameScore: GameScore;
	showMultiplier?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
	gameScore,
	showMultiplier = true,
}) => {
	const formatScore = (score: number): string => {
		if (score >= 1000000) {
			return `${(score / 1000000).toFixed(1)}M`;
		} else if (score >= 1000) {
			return `${(score / 1000).toFixed(1)}K`;
		}
		return score.toString();
	};

	return (
		<View style={styles.container}>
			<View style={styles.mainScore}>
				<Trophy size={24} color='#fbbf24' />
				<Text style={styles.scoreText}>
					{formatScore(gameScore.currentScore)}
				</Text>
			</View>

			{showMultiplier && gameScore.cascadeMultiplier > 1 && (
				<View style={styles.multiplierContainer}>
					<Zap size={16} color='#ef4444' />
					<Text style={styles.multiplierText}>
						{gameScore.cascadeMultiplier}x Cascade
					</Text>
				</View>
			)}

			<View style={styles.statsContainer}>
				<View style={styles.statItem}>
					<Target size={14} color='#6b7280' />
					<Text style={styles.statText}>{gameScore.totalMatches}</Text>
				</View>

				{gameScore.highScore > 0 && (
					<View style={styles.statItem}>
						<Text style={styles.statLabel}>Best:</Text>
						<Text style={styles.statText}>
							{formatScore(gameScore.highScore)}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#ffffff',
		borderRadius: 15,
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
		borderWidth: 2,
		borderColor: '#fbbf24',
	},
	mainScore: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 8,
	},
	scoreText: {
		fontSize: 28,
		fontWeight: '900',
		color: '#1f2937',
		marginLeft: 8,
		fontFamily: 'Orbitron-Black',
	},
	multiplierContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fef2f2',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
		marginBottom: 8,
		alignSelf: 'center',
	},
	multiplierText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#ef4444',
		marginLeft: 4,
		fontFamily: 'Orbitron-Bold',
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#e5e7eb',
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statLabel: {
		fontSize: 12,
		color: '#6b7280',
		fontWeight: '500',
		marginRight: 4,
		fontFamily: 'Orbitron-Regular',
	},
	statText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginLeft: 4,
		fontFamily: 'Orbitron-Bold',
	},
});

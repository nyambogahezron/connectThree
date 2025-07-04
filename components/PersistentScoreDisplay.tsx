import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameScore } from '@/interfaces/scoring';
import { Trophy, Zap, Target, TrendingUp, Award } from 'lucide-react-native';

interface PersistentScoreDisplayProps {
	gameScore: GameScore;
	showLifetimeStats?: boolean;
	showMultiplier?: boolean;
}

export const PersistentScoreDisplay: React.FC<PersistentScoreDisplayProps> = ({
	gameScore,
	showLifetimeStats = true,
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

	const unlockedAchievements = gameScore.achievements.filter(
		(a) => a.unlocked
	).length;

	return (
		<View style={styles.container}>
			{/* Main Score Section */}
			<View style={styles.mainScoreSection}>
				<View style={styles.currentScore}>
					<Trophy size={28} color='#fbbf24' />
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
			</View>

			{/* Score Breakdown */}
			<View style={styles.breakdownSection}>
				<View style={styles.breakdownItem}>
					<Text style={styles.breakdownLabel}>Base</Text>
					<Text style={styles.breakdownValue}>
						{formatScore(gameScore.basePoints)}
					</Text>
				</View>
				<View style={styles.breakdownItem}>
					<Text style={styles.breakdownLabel}>Bonus</Text>
					<Text style={styles.breakdownValue}>
						{formatScore(gameScore.bonusPoints)}
					</Text>
				</View>
				<View style={styles.breakdownItem}>
					<Target size={14} color='#6b7280' />
					<Text style={styles.breakdownValue}>{gameScore.totalMatches}</Text>
				</View>
			</View>

			{/* Lifetime Stats */}
			{showLifetimeStats && (
				<View style={styles.lifetimeSection}>
					<View style={styles.lifetimeItem}>
						<TrendingUp size={16} color='#059669' />
						<View style={styles.lifetimeText}>
							<Text style={styles.lifetimeLabel}>Best</Text>
							<Text style={styles.lifetimeValue}>
								{formatScore(gameScore.highScore)}
							</Text>
						</View>
					</View>

					<View style={styles.lifetimeItem}>
						<Award size={16} color='#7c3aed' />
						<View style={styles.lifetimeText}>
							<Text style={styles.lifetimeLabel}>Achievements</Text>
							<Text style={styles.lifetimeValue}>{unlockedAchievements}</Text>
						</View>
					</View>

					<View style={styles.lifetimeItem}>
						<Trophy size={16} color='#f59e0b' />
						<View style={styles.lifetimeText}>
							<Text style={styles.lifetimeLabel}>Lifetime</Text>
							<Text style={styles.lifetimeValue}>
								{formatScore(gameScore.totalLifetimeScore)}
							</Text>
						</View>
					</View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 5,
		borderWidth: 2,
		borderColor: '#fbbf24',
	},
	mainScoreSection: {
		alignItems: 'center',
		marginBottom: 16,
	},
	currentScore: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	scoreText: {
		fontSize: 32,
		fontWeight: '900',
		color: '#1f2937',
		marginLeft: 12,
		fontFamily: 'Orbitron-Black',
	},
	multiplierContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fef2f2',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
	},
	multiplierText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#ef4444',
		marginLeft: 6,
		fontFamily: 'Orbitron-Bold',
	},
	breakdownSection: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: 12,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#e5e7eb',
		marginBottom: 16,
	},
	breakdownItem: {
		alignItems: 'center',
		flex: 1,
	},
	breakdownLabel: {
		fontSize: 12,
		color: '#6b7280',
		fontWeight: '500',
		marginBottom: 4,
		fontFamily: 'Orbitron-Regular',
	},
	breakdownValue: {
		fontSize: 16,
		fontWeight: '700',
		color: '#374151',
		fontFamily: 'Orbitron-Bold',
	},
	lifetimeSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	lifetimeItem: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		marginHorizontal: 4,
	},
	lifetimeText: {
		marginLeft: 6,
		alignItems: 'center',
	},
	lifetimeLabel: {
		fontSize: 10,
		color: '#6b7280',
		fontWeight: '500',
		fontFamily: 'Orbitron-Regular',
	},
	lifetimeValue: {
		fontSize: 14,
		fontWeight: '700',
		color: '#374151',
		fontFamily: 'Orbitron-Bold',
	},
});

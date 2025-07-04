import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameStats, GameVariant } from '@/interfaces/game';
import { Crown } from 'lucide-react-native';

interface ScoreBoardProps {
	stats: GameStats;
	gameVariant?: GameVariant;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
	stats,
	gameVariant = 'connect3',
}) => {
	const currentStats =
		gameVariant === 'classic'
			? {
					redWins: stats.classicRedWins,
					yellowWins: stats.classicYellowWins,
					draws: stats.classicDraws,
					totalGames: stats.classicTotalGames,
			  }
			: {
					redWins: stats.redWins,
					yellowWins: stats.yellowWins,
					draws: stats.draws,
					totalGames: stats.totalGames,
			  };

	return (
		<View style={styles.container}>
			<View style={styles.titleContainer}>
				<Text style={styles.title}>Score Board</Text>
				{gameVariant === 'classic' && <Crown size={20} color='#fbbf24' />}
			</View>
			<View style={styles.scoresContainer}>
				<View style={styles.scoreItem}>
					<View style={[styles.playerDisc, { backgroundColor: '#ef4444' }]} />
					<Text style={styles.scoreText}>Red: {currentStats.redWins}</Text>
				</View>
				<View style={styles.scoreItem}>
					<View style={[styles.playerDisc, { backgroundColor: '#fbbf24' }]} />
					<Text style={styles.scoreText}>
						Yellow: {currentStats.yellowWins}
					</Text>
				</View>
				<View style={styles.scoreItem}>
					<Text style={styles.scoreText}>Draws: {currentStats.draws}</Text>
				</View>
			</View>
			<Text style={styles.totalGames}>
				Total {gameVariant === 'classic' ? 'Classic' : 'Connect 3'} Games:{' '}
				{currentStats.totalGames}
			</Text>
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
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
		gap: 8,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
		textAlign: 'center',
		fontFamily: 'Orbitron-Bold',
	},
	scoresContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 8,
	},
	scoreItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	playerDisc: {
		width: 16,
		height: 16,
		borderRadius: 8,
		marginRight: 6,
	},
	scoreText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		fontFamily: 'Orbitron-Regular',
	},
	totalGames: {
		fontSize: 12,
		color: '#6b7280',
		textAlign: 'center',
		fontWeight: '500',
		fontFamily: 'Orbitron-Regular',
	},
});

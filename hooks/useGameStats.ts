import { useState, useCallback } from 'react';
import { GameStats, Player, GameVariant } from '@/interfaces/game';

export const useGameStats = () => {
	const [stats, setStats] = useState<GameStats>({
		redWins: 0,
		yellowWins: 0,
		draws: 0,
		totalGames: 0,
		classicRedWins: 0,
		classicYellowWins: 0,
		classicDraws: 0,
		classicTotalGames: 0,
	});

	const updateStats = useCallback(
		(result: 'red' | 'yellow' | 'draw', variant: GameVariant = 'connect3') => {
			setStats((prev) => {
				if (variant === 'classic') {
					return {
						...prev,
						classicRedWins:
							result === 'red' ? prev.classicRedWins + 1 : prev.classicRedWins,
						classicYellowWins:
							result === 'yellow'
								? prev.classicYellowWins + 1
								: prev.classicYellowWins,
						classicDraws:
							result === 'draw' ? prev.classicDraws + 1 : prev.classicDraws,
						classicTotalGames: prev.classicTotalGames + 1,
					};
				} else {
					return {
						...prev,
						redWins: result === 'red' ? prev.redWins + 1 : prev.redWins,
						yellowWins:
							result === 'yellow' ? prev.yellowWins + 1 : prev.yellowWins,
						draws: result === 'draw' ? prev.draws + 1 : prev.draws,
						totalGames: prev.totalGames + 1,
					};
				}
			});
		},
		[]
	);

	const resetStats = useCallback(() => {
		setStats({
			redWins: 0,
			yellowWins: 0,
			draws: 0,
			totalGames: 0,
			classicRedWins: 0,
			classicYellowWins: 0,
			classicDraws: 0,
			classicTotalGames: 0,
		});
	}, []);

	return {
		stats,
		updateStats,
		resetStats,
	};
};

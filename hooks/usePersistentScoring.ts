import { useState, useCallback, useEffect, useRef } from 'react';
import { DatabaseService } from '@/services/database';
import { GameVariant } from '@/types/game';
import {
	GameScore,
	ScoreEvent,
	Achievement,
	ScoreAnimation,
} from '@/types/scoring';

interface PersistentScoringConfig {
	gameVariant: GameVariant;
	gameMode: 'pvp' | 'ai';
	aiDifficulty?: 'easy' | 'medium' | 'hard';
	playerId: string;
	playerColor: 'red' | 'yellow';
}

export const usePersistentScoring = (config: PersistentScoringConfig) => {
	const [gameScore, setGameScore] = useState<GameScore>({
		currentScore: 0,
		basePoints: 0,
		bonusPoints: 0,
		cascadeMultiplier: 1,
		currentCascadeLevel: 0,
		totalMatches: 0,
		achievements: [],
		scoreEvents: [],
		highScore: 0,
		totalLifetimeScore: 0,
	});

	const [scoreAnimations, setScoreAnimations] = useState<ScoreAnimation[]>([]);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	const animationIdRef = useRef(0);
	const moveCounterRef = useRef(0);

	// Initialize game session
	const initializeSession = useCallback(async () => {
		try {
			const session = await DatabaseService.createGameSession(
				config.gameVariant,
				config.gameMode,
				config.aiDifficulty
			);

			setSessionId(session.id);

			// Create initial player score record
			await DatabaseService.createPlayerScore(
				session.id,
				config.playerId,
				config.playerColor,
				{
					finalScore: 0,
					basePoints: 0,
					bonusPoints: 0,
					cascadePoints: 0,
					achievementPoints: 0,
					totalMatches: 0,
					maxCascadeLevel: 0,
					kingsCreated: 0,
					movesUsed: 0,
				}
			);

			// Load player's high score and achievements
			const playerStats = await DatabaseService.getPlayerStats(config.playerId);
			const achievements = await DatabaseService.getPlayerAchievements(
				config.playerId
			);

			setGameScore((prev) => ({
				...prev,
				highScore:
					config.gameVariant === 'connect3'
						? playerStats?.connect3HighScore || 0
						: playerStats?.classicHighScore || 0,
				totalLifetimeScore: playerStats?.totalScore || 0,
				achievements: achievements.map((a) => ({
					id: a.achievementId,
					name: a.achievementName,
					description: a.achievementDescription,
					points: a.points,
					unlocked: true,
					unlockedAt: a.unlockedAt?.getTime(),
				})),
			}));

			setIsInitialized(true);
		} catch (error) {
			console.error('Failed to initialize scoring session:', error);
		}
	}, [config]);

	// Calculate base points for a match
	const calculateBasePoints = useCallback(
		(matchSize: number, isKing: boolean = false): number => {
			let basePoints = 0;

			switch (matchSize) {
				case 3:
					basePoints = 100;
					break;
				case 4:
					basePoints = 200;
					break;
				case 5:
					basePoints = 300;
					break;
				default:
					basePoints = Math.max(300, matchSize * 60);
			}

			if (isKing) {
				basePoints *= 2;
			}

			return basePoints;
		},
		[]
	);

	// Calculate cascade multiplier
	const getCascadeMultiplier = useCallback((cascadeLevel: number): number => {
		if (cascadeLevel === 0) return 1;
		if (cascadeLevel === 1) return 1.5;
		if (cascadeLevel === 2) return 2;
		return 3;
	}, []);

	// Add score animation
	const addScoreAnimation = useCallback(
		(
			points: number,
			position: { x: number; y: number },
			color: string = '#4f46e5'
		) => {
			const animationId = `score-${animationIdRef.current++}`;
			const newAnimation: ScoreAnimation = {
				id: animationId,
				points,
				position,
				color,
				scale: 1,
				opacity: 1,
			};

			setScoreAnimations((prev) => [...prev, newAnimation]);

			setTimeout(() => {
				setScoreAnimations((prev) =>
					prev.filter((anim) => anim.id !== animationId)
				);
			}, 2000);
		},
		[]
	);

	// Award points for a match
	const awardMatchPoints = useCallback(
		async (
			matchSize: number,
			cascadeLevel: number = 0,
			simultaneousMatches: number = 1,
			isKing: boolean = false,
			position?: { x: number; y: number }
		) => {
			if (!sessionId) return;

			const basePoints = calculateBasePoints(matchSize, isKing);
			const cascadeMultiplier = getCascadeMultiplier(cascadeLevel);
			const simultaneousBonus =
				simultaneousMatches > 1 ? 1 + (simultaneousMatches - 1) * 0.5 : 1;

			const totalPoints = Math.round(
				basePoints * cascadeMultiplier * simultaneousBonus
			);
			const cascadePoints = totalPoints - basePoints;

			moveCounterRef.current++;

			// Create score event in database
			await DatabaseService.addScoreEvent(sessionId, config.playerId, {
				eventType: 'match',
				points: totalPoints,
				multiplier: cascadeMultiplier * simultaneousBonus,
				description: `${matchSize} ${isKing ? 'King ' : ''}Match${
					cascadeLevel > 0 ? ` (Cascade x${cascadeLevel + 1})` : ''
				}`,
				matchSize,
				cascadeLevel,
				isKingMatch: isKing,
				simultaneousMatches,
				moveNumber: moveCounterRef.current,
			});

			const scoreEvent: ScoreEvent = {
				type: 'match',
				points: totalPoints,
				multiplier: cascadeMultiplier * simultaneousBonus,
				description: `${matchSize} ${isKing ? 'King ' : ''}Match${
					cascadeLevel > 0 ? ` (Cascade x${cascadeLevel + 1})` : ''
				}`,
				timestamp: Date.now(),
			};

			setGameScore((prev) => {
				const newScore = {
					...prev,
					currentScore: prev.currentScore + totalPoints,
					basePoints: prev.basePoints + basePoints,
					bonusPoints: prev.bonusPoints + (totalPoints - basePoints),
					cascadeMultiplier: cascadeMultiplier,
					currentCascadeLevel: cascadeLevel,
					totalMatches: prev.totalMatches + 1,
					scoreEvents: [scoreEvent, ...prev.scoreEvents.slice(0, 9)],
				};

				// Update player score in database
				DatabaseService.updatePlayerScore(sessionId!, config.playerId, {
					finalScore: newScore.currentScore,
					basePoints: newScore.basePoints,
					bonusPoints: newScore.bonusPoints,
					cascadePoints: prev.bonusPoints + cascadePoints,
					totalMatches: newScore.totalMatches,
					maxCascadeLevel: Math.max(prev.currentCascadeLevel, cascadeLevel),
					movesUsed: moveCounterRef.current,
				});

				return newScore;
			});

			if (position) {
				addScoreAnimation(
					totalPoints,
					position,
					isKing ? '#fbbf24' : '#4f46e5'
				);
			}
		},
		[
			sessionId,
			config.playerId,
			calculateBasePoints,
			getCascadeMultiplier,
			addScoreAnimation,
		]
	);

	// Award achievement
	const awardAchievement = useCallback(
		async (
			achievementId: string,
			achievementName: string,
			achievementDescription: string,
			points: number,
			position?: { x: number; y: number }
		) => {
			if (!sessionId) return;

			// Check if already unlocked
			const hasAchievement = await DatabaseService.hasAchievement(
				config.playerId,
				achievementId
			);
			if (hasAchievement) return;

			// Unlock achievement in database
			await DatabaseService.unlockAchievement(
				config.playerId,
				achievementId,
				achievementName,
				achievementDescription,
				points,
				sessionId
			);

			// Add score event
			await DatabaseService.addScoreEvent(sessionId, config.playerId, {
				eventType: 'achievement',
				points,
				multiplier: 1,
				description: `Achievement: ${achievementName}`,
				moveNumber: moveCounterRef.current,
			});

			const scoreEvent: ScoreEvent = {
				type: 'achievement',
				points,
				multiplier: 1,
				description: `Achievement: ${achievementName}`,
				timestamp: Date.now(),
			};

			setGameScore((prev) => {
				const updatedAchievements = [...prev.achievements];
				const existingIndex = updatedAchievements.findIndex(
					(a) => a.id === achievementId
				);

				if (existingIndex === -1) {
					updatedAchievements.push({
						id: achievementId,
						name: achievementName,
						description: achievementDescription,
						points,
						unlocked: true,
						unlockedAt: Date.now(),
					});
				}

				const newScore = {
					...prev,
					currentScore: prev.currentScore + points,
					bonusPoints: prev.bonusPoints + points,
					achievements: updatedAchievements,
					scoreEvents: [scoreEvent, ...prev.scoreEvents.slice(0, 9)],
				};

				// Update player score in database
				DatabaseService.updatePlayerScore(sessionId!, config.playerId, {
					finalScore: newScore.currentScore,
					bonusPoints: newScore.bonusPoints,
					achievementPoints: prev.bonusPoints + points,
				});

				return newScore;
			});

			if (position) {
				addScoreAnimation(points, position, '#fbbf24');
			}
		},
		[sessionId, config.playerId, addScoreAnimation]
	);

	// Complete game session
	const completeSession = useCallback(
		async (
			winner: string | null,
			winType: 'regular' | 'king' | 'timeout',
			duration: number,
			kingsCreated: number = 0,
			maxCascadeLevel: number = 0,
			perfectGame: boolean = false
		) => {
			if (!sessionId) return;

			try {
				// Complete session in database
				await DatabaseService.completeGameSession(
					sessionId,
					winner,
					winType,
					duration,
					moveCounterRef.current
				);

				// Update final player score
				await DatabaseService.updatePlayerScore(sessionId, config.playerId, {
					kingsCreated,
					maxCascadeLevel,
					rank: winner === config.playerId ? 1 : winner ? 2 : null,
				});

				// Update player statistics
				await DatabaseService.updatePlayerStats(
					config.playerId,
					config.gameVariant,
					{
						won: winner === config.playerId,
						draw: winner === null,
						score: gameScore.currentScore,
						matches: gameScore.totalMatches,
						cascades: gameScore.currentCascadeLevel,
						maxCascadeLevel,
						kingsCreated,
						movesUsed: moveCounterRef.current,
						duration,
						perfectGame,
					}
				);

				// Update leaderboards
				await DatabaseService.updateLeaderboards();

				// Update high score
				setGameScore((prev) => ({
					...prev,
					highScore: Math.max(prev.highScore, prev.currentScore),
					totalLifetimeScore: prev.totalLifetimeScore + prev.currentScore,
				}));
			} catch (error) {
				console.error('Failed to complete session:', error);
			}
		},
		[
			sessionId,
			config.playerId,
			config.gameVariant,
			gameScore.currentScore,
			gameScore.totalMatches,
			gameScore.currentCascadeLevel,
		]
	);

	// Reset for new game
	const resetSession = useCallback(() => {
		setGameScore((prev) => ({
			...prev,
			currentScore: 0,
			basePoints: 0,
			bonusPoints: 0,
			cascadeMultiplier: 1,
			currentCascadeLevel: 0,
			totalMatches: 0,
			scoreEvents: [],
		}));

		setScoreAnimations([]);
		setSessionId(null);
		setIsInitialized(false);
		moveCounterRef.current = 0;
	}, []);

	// Initialize on mount
	useEffect(() => {
		if (!isInitialized) {
			initializeSession();
		}
	}, [initializeSession, isInitialized]);

	return {
		gameScore,
		scoreAnimations,
		sessionId,
		isInitialized,
		awardMatchPoints,
		awardAchievement,
		completeSession,
		resetSession,
		incrementMoves: () => {
			moveCounterRef.current++;
		},
	};
};

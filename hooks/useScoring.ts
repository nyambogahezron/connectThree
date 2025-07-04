import { useState, useCallback, useRef } from 'react';
import {
	GameScore,
	ScoreEvent,
	CascadeData,
	Achievement,
	LevelStats,
	ScoreAnimation,
} from '@/interfaces/scoring';
import { GameVariant } from '@/interfaces/game';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
	{
		id: 'first_match',
		name: 'First Blood',
		description: 'Make your first match',
		points: 50,
		unlocked: false,
	},
	{
		id: 'cascade_master',
		name: 'Cascade Master',
		description: 'Achieve 5+ cascades in a single turn',
		points: 1000,
		unlocked: false,
	},
	{
		id: 'column_clearer',
		name: 'Column Destroyer',
		description: 'Clear an entire column',
		points: 500,
		unlocked: false,
	},
	{
		id: 'row_clearer',
		name: 'Row Annihilator',
		description: 'Clear an entire row',
		points: 500,
		unlocked: false,
	},
	{
		id: 'perfect_game',
		name: 'Perfectionist',
		description: 'Complete level under par moves',
		points: 2000,
		unlocked: false,
	},
	{
		id: 'king_maker',
		name: 'King Maker',
		description: 'Create 5 kings in Classic mode',
		points: 750,
		unlocked: false,
	},
	{
		id: 'ultimate_victory',
		name: 'Ultimate Champion',
		description: 'Win with 3 matching kings',
		points: 1500,
		unlocked: false,
	},
	{
		id: 'combo_master',
		name: 'Combo Master',
		description: 'Trigger 3 simultaneous matches',
		points: 800,
		unlocked: false,
	},
];

export const useScoring = (gameVariant: GameVariant = 'connect3') => {
	const [gameScore, setGameScore] = useState<GameScore>({
		currentScore: 0,
		basePoints: 0,
		bonusPoints: 0,
		cascadeMultiplier: 1,
		currentCascadeLevel: 0,
		totalMatches: 0,
		achievements: [...INITIAL_ACHIEVEMENTS],
		scoreEvents: [],
		highScore: 0,
		totalLifetimeScore: 0,
	});

	const [scoreAnimations, setScoreAnimations] = useState<ScoreAnimation[]>([]);
	const [levelStats, setLevelStats] = useState<LevelStats>({
		movesUsed: 0,
		parMoves: 20,
		timeElapsed: 0,
		perfectGame: false,
		cascadeCount: 0,
		maxCascadeLevel: 0,
	});

	const animationIdRef = useRef(0);

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

			// King matches are worth more
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
		return 3; // 3+ cascades
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

			// Remove animation after 2 seconds
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
		(
			matchSize: number,
			cascadeLevel: number = 0,
			simultaneousMatches: number = 1,
			isKing: boolean = false,
			position?: { x: number; y: number }
		) => {
			const basePoints = calculateBasePoints(matchSize, isKing);
			const cascadeMultiplier = getCascadeMultiplier(cascadeLevel);
			const simultaneousBonus =
				simultaneousMatches > 1 ? 1 + (simultaneousMatches - 1) * 0.5 : 1;

			const totalPoints = Math.round(
				basePoints * cascadeMultiplier * simultaneousBonus
			);

			const scoreEvent: ScoreEvent = {
				type: 'match',
				points: totalPoints,
				multiplier: cascadeMultiplier * simultaneousBonus,
				description: `${matchSize} ${isKing ? 'King ' : ''}Match${
					cascadeLevel > 0 ? ` (Cascade x${cascadeLevel + 1})` : ''
				}`,
				timestamp: Date.now(),
			};

			setGameScore((prev) => ({
				...prev,
				currentScore: prev.currentScore + totalPoints,
				basePoints: prev.basePoints + basePoints,
				bonusPoints: prev.bonusPoints + (totalPoints - basePoints),
				cascadeMultiplier: cascadeMultiplier,
				currentCascadeLevel: cascadeLevel,
				totalMatches: prev.totalMatches + 1,
				scoreEvents: [scoreEvent, ...prev.scoreEvents.slice(0, 9)], // Keep last 10 events
			}));

			// Add score animation
			if (position) {
				addScoreAnimation(
					totalPoints,
					position,
					isKing ? '#fbbf24' : '#4f46e5'
				);
			}

			// Update level stats
			setLevelStats((prev) => ({
				...prev,
				cascadeCount: prev.cascadeCount + (cascadeLevel > 0 ? 1 : 0),
				maxCascadeLevel: Math.max(prev.maxCascadeLevel, cascadeLevel),
			}));
		},
		[calculateBasePoints, getCascadeMultiplier, addScoreAnimation]
	);

	// Award achievement
	const awardAchievement = useCallback(
		(achievementId: string, position?: { x: number; y: number }) => {
			setGameScore((prev) => {
				const achievement = prev.achievements.find(
					(a) => a.id === achievementId
				);
				if (!achievement || achievement.unlocked) return prev;

				const updatedAchievements = prev.achievements.map((a) =>
					a.id === achievementId
						? { ...a, unlocked: true, unlockedAt: Date.now() }
						: a
				);

				const scoreEvent: ScoreEvent = {
					type: 'achievement',
					points: achievement.points,
					multiplier: 1,
					description: `Achievement: ${achievement.name}`,
					timestamp: Date.now(),
				};

				// Add achievement animation
				if (position) {
					addScoreAnimation(achievement.points, position, '#fbbf24');
				}

				return {
					...prev,
					currentScore: prev.currentScore + achievement.points,
					bonusPoints: prev.bonusPoints + achievement.points,
					achievements: updatedAchievements,
					scoreEvents: [scoreEvent, ...prev.scoreEvents.slice(0, 9)],
				};
			});
		},
		[addScoreAnimation]
	);

	// Award bonus points
	const awardBonus = useCallback(
		(
			points: number,
			description: string,
			position?: { x: number; y: number }
		) => {
			const scoreEvent: ScoreEvent = {
				type: 'bonus',
				points,
				multiplier: 1,
				description,
				timestamp: Date.now(),
			};

			setGameScore((prev) => ({
				...prev,
				currentScore: prev.currentScore + points,
				bonusPoints: prev.bonusPoints + points,
				scoreEvents: [scoreEvent, ...prev.scoreEvents.slice(0, 9)],
			}));

			if (position) {
				addScoreAnimation(points, position, '#059669');
			}
		},
		[addScoreAnimation]
	);

	// Check for achievements
	const checkAchievements = useCallback(
		(
			matchSize: number,
			cascadeLevel: number,
			isKing: boolean,
			kingsCreated: number,
			isUltimateVictory: boolean
		) => {
			// First match
			if (gameScore.totalMatches === 0) {
				awardAchievement('first_match');
			}

			// Cascade master
			if (cascadeLevel >= 5) {
				awardAchievement('cascade_master');
			}

			// King maker (Classic mode)
			if (gameVariant === 'classic' && kingsCreated >= 5) {
				awardAchievement('king_maker');
			}

			// Ultimate victory (Classic mode)
			if (gameVariant === 'classic' && isUltimateVictory) {
				awardAchievement('ultimate_victory');
			}
		},
		[gameScore.totalMatches, gameVariant, awardAchievement]
	);

	// Increment move counter
	const incrementMoves = useCallback(() => {
		setLevelStats((prev) => ({
			...prev,
			movesUsed: prev.movesUsed + 1,
		}));
	}, []);

	// Complete level
	const completeLevel = useCallback(() => {
		const perfectGame = levelStats.movesUsed <= levelStats.parMoves;

		if (perfectGame) {
			awardAchievement('perfect_game');
			awardBonus(2000, 'Perfect Game Bonus!');
		}

		// Update high score
		setGameScore((prev) => ({
			...prev,
			highScore: Math.max(prev.highScore, prev.currentScore),
			totalLifetimeScore: prev.totalLifetimeScore + prev.currentScore,
		}));

		setLevelStats((prev) => ({
			...prev,
			perfectGame,
		}));
	}, [levelStats.movesUsed, levelStats.parMoves, awardAchievement, awardBonus]);

	// Reset game score
	const resetScore = useCallback(() => {
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

		setLevelStats({
			movesUsed: 0,
			parMoves: 20,
			timeElapsed: 0,
			perfectGame: false,
			cascadeCount: 0,
			maxCascadeLevel: 0,
		});

		setScoreAnimations([]);
	}, []);

	// Reset all achievements
	const resetAchievements = useCallback(() => {
		setGameScore((prev) => ({
			...prev,
			achievements: INITIAL_ACHIEVEMENTS.map((a) => ({
				...a,
				unlocked: false,
				unlockedAt: undefined,
			})),
			highScore: 0,
			totalLifetimeScore: 0,
		}));
	}, []);

	return {
		gameScore,
		scoreAnimations,
		levelStats,
		awardMatchPoints,
		awardAchievement,
		awardBonus,
		checkAchievements,
		incrementMoves,
		completeLevel,
		resetScore,
		resetAchievements,
	};
};

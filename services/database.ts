import { db } from '../database';
import {
	players,
	gameSessions,
	playerScores,
	scoreEvents,
	playerAchievements,
	playerStats,
	leaderboards,
	type NewPlayer,
	type NewGameSession,
	type NewPlayerScore,
	type NewScoreEvent,
	type NewPlayerAchievement,
	type Player,
	type GameSession,
	type PlayerScore,
	type PlayerStats,
} from '../database/schema';
import { eq, desc, asc, and, sql, count, avg, max, sum } from 'drizzle-orm';
import { GameVariant } from '@/interfaces/game';

// Generate unique IDs
const generateId = () =>
	`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export class DatabaseService {
	// Player management
	static async createPlayer(name: string, avatar?: string): Promise<Player> {
		const newPlayer: NewPlayer = {
			id: generateId(),
			name,
			avatar,
		};

		const [player] = await db.insert(players).values(newPlayer).returning();

		// Initialize player stats
		await db.insert(playerStats).values({
			playerId: player.id,
		});

		return player;
	}

	static async getPlayer(id: string): Promise<Player | null> {
		const [player] = await db.select().from(players).where(eq(players.id, id));
		return player || null;
	}

	static async getAllPlayers(): Promise<Player[]> {
		return await db.select().from(players).orderBy(asc(players.name));
	}

	static async updatePlayer(
		id: string,
		updates: Partial<Pick<Player, 'name' | 'avatar'>>
	): Promise<Player | null> {
		const [player] = await db
			.update(players)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(players.id, id))
			.returning();

		return player || null;
	}

	// Game session management
	static async createGameSession(
		gameVariant: GameVariant,
		gameMode: 'pvp' | 'ai',
		aiDifficulty?: 'easy' | 'medium' | 'hard'
	): Promise<GameSession> {
		const newSession: NewGameSession = {
			id: generateId(),
			gameVariant,
			gameMode,
			aiDifficulty,
			status: 'active',
		};

		const [session] = await db
			.insert(gameSessions)
			.values(newSession)
			.returning();
		return session;
	}

	static async completeGameSession(
		sessionId: string,
		winner: string | null,
		winType: 'regular' | 'king' | 'timeout',
		duration: number,
		totalMoves: number
	): Promise<void> {
		await db
			.update(gameSessions)
			.set({
				status: 'completed',
				completedAt: new Date(),
				winner,
				winType,
				duration,
				totalMoves,
			})
			.where(eq(gameSessions.id, sessionId));
	}

	static async getGameSession(id: string): Promise<GameSession | null> {
		const [session] = await db
			.select()
			.from(gameSessions)
			.where(eq(gameSessions.id, id));
		return session || null;
	}

	static async getPlayerGameHistory(
		playerId: string,
		limit = 20
	): Promise<GameSession[]> {
		const results = await db
			.select()
			.from(gameSessions)
			.innerJoin(playerScores, eq(gameSessions.id, playerScores.sessionId))
			.where(eq(playerScores.playerId, playerId))
			.orderBy(desc(gameSessions.startedAt))
			.limit(limit);

		return results.map((row: any) => row.game_sessions);
	}

	// Player scores
	static async createPlayerScore(
		sessionId: string,
		playerId: string,
		playerColor: 'red' | 'yellow',
		scoreData: Partial<PlayerScore>
	): Promise<PlayerScore> {
		const newScore: NewPlayerScore = {
			id: generateId(),
			sessionId,
			playerId,
			playerColor,
			...scoreData,
		};

		const [score] = await db.insert(playerScores).values(newScore).returning();
		return score;
	}

	static async updatePlayerScore(
		sessionId: string,
		playerId: string,
		updates: Partial<PlayerScore>
	): Promise<void> {
		await db
			.update(playerScores)
			.set(updates)
			.where(
				and(
					eq(playerScores.sessionId, sessionId),
					eq(playerScores.playerId, playerId)
				)
			);
	}

	static async getPlayerScoreForSession(
		sessionId: string,
		playerId: string
	): Promise<PlayerScore | null> {
		const [score] = await db
			.select()
			.from(playerScores)
			.where(
				and(
					eq(playerScores.sessionId, sessionId),
					eq(playerScores.playerId, playerId)
				)
			);

		return score || null;
	}

	// Score events
	static async addScoreEvent(
		sessionId: string,
		playerId: string,
		eventData: Omit<NewScoreEvent, 'id' | 'sessionId' | 'playerId'>
	): Promise<void> {
		const newEvent: NewScoreEvent = {
			id: generateId(),
			sessionId,
			playerId,
			...eventData,
		};

		await db.insert(scoreEvents).values(newEvent);
	}

	static async getScoreEventsForSession(sessionId: string): Promise<any[]> {
		return await db
			.select()
			.from(scoreEvents)
			.where(eq(scoreEvents.sessionId, sessionId))
			.orderBy(asc(scoreEvents.moveNumber), asc(scoreEvents.timestamp));
	}

	static async getPlayerScoreEvents(
		playerId: string,
		limit = 50
	): Promise<any[]> {
		return await db
			.select()
			.from(scoreEvents)
			.where(eq(scoreEvents.playerId, playerId))
			.orderBy(desc(scoreEvents.timestamp))
			.limit(limit);
	}

	// Achievements
	static async unlockAchievement(
		playerId: string,
		achievementId: string,
		achievementName: string,
		achievementDescription: string,
		points: number,
		sessionId?: string
	): Promise<void> {
		const newAchievement: NewPlayerAchievement = {
			id: generateId(),
			playerId,
			achievementId,
			achievementName,
			achievementDescription,
			points,
			sessionId,
		};

		try {
			await db.insert(playerAchievements).values(newAchievement);
		} catch (error) {
			// Achievement already unlocked, ignore
			console.log('Achievement already unlocked:', achievementId);
		}
	}

	static async getPlayerAchievements(playerId: string): Promise<any[]> {
		return await db
			.select()
			.from(playerAchievements)
			.where(eq(playerAchievements.playerId, playerId))
			.orderBy(desc(playerAchievements.unlockedAt));
	}

	static async hasAchievement(
		playerId: string,
		achievementId: string
	): Promise<boolean> {
		const [achievement] = await db
			.select()
			.from(playerAchievements)
			.where(
				and(
					eq(playerAchievements.playerId, playerId),
					eq(playerAchievements.achievementId, achievementId)
				)
			);

		return !!achievement;
	}

	// Player statistics
	static async updatePlayerStats(
		playerId: string,
		gameVariant: GameVariant,
		gameResult: {
			won: boolean;
			draw: boolean;
			score: number;
			matches: number;
			cascades: number;
			maxCascadeLevel: number;
			kingsCreated: number;
			movesUsed: number;
			duration: number;
			perfectGame: boolean;
		}
	): Promise<void> {
		const stats = await this.getPlayerStats(playerId);

		if (!stats) {
			// Create initial stats if they don't exist
			await db.insert(playerStats).values({ playerId });
		}

		const isConnect3 = gameVariant === 'connect3';
		const isClassic = gameVariant === 'classic';

		const updates: Partial<PlayerStats> = {
			// Game-specific stats
			...(isConnect3 && {
				connect3GamesPlayed: (stats?.connect3GamesPlayed || 0) + 1,
				connect3Wins: (stats?.connect3Wins || 0) + (gameResult.won ? 1 : 0),
				connect3Losses:
					(stats?.connect3Losses || 0) +
					(!gameResult.won && !gameResult.draw ? 1 : 0),
				connect3Draws: (stats?.connect3Draws || 0) + (gameResult.draw ? 1 : 0),
				connect3TotalScore: (stats?.connect3TotalScore || 0) + gameResult.score,
				connect3HighScore: Math.max(
					stats?.connect3HighScore || 0,
					gameResult.score
				),
			}),

			...(isClassic && {
				classicGamesPlayed: (stats?.classicGamesPlayed || 0) + 1,
				classicWins: (stats?.classicWins || 0) + (gameResult.won ? 1 : 0),
				classicLosses:
					(stats?.classicLosses || 0) +
					(!gameResult.won && !gameResult.draw ? 1 : 0),
				classicDraws: (stats?.classicDraws || 0) + (gameResult.draw ? 1 : 0),
				classicTotalScore: (stats?.classicTotalScore || 0) + gameResult.score,
				classicHighScore: Math.max(
					stats?.classicHighScore || 0,
					gameResult.score
				),
			}),

			// Overall stats
			totalGamesPlayed: (stats?.totalGamesPlayed || 0) + 1,
			totalWins: (stats?.totalWins || 0) + (gameResult.won ? 1 : 0),
			totalScore: (stats?.totalScore || 0) + gameResult.score,
			totalPlayTime: (stats?.totalPlayTime || 0) + gameResult.duration,
			totalMatches: (stats?.totalMatches || 0) + gameResult.matches,
			totalCascades: (stats?.totalCascades || 0) + gameResult.cascades,
			maxCascadeInGame: Math.max(
				stats?.maxCascadeInGame || 0,
				gameResult.maxCascadeLevel
			),
			totalKingsCreated:
				(stats?.totalKingsCreated || 0) + gameResult.kingsCreated,
			perfectGames:
				(stats?.perfectGames || 0) + (gameResult.perfectGame ? 1 : 0),

			// Win streak
			currentWinStreak: gameResult.won ? (stats?.currentWinStreak || 0) + 1 : 0,
			longestWinStreak: gameResult.won
				? Math.max(
						stats?.longestWinStreak || 0,
						(stats?.currentWinStreak || 0) + 1
				  )
				: stats?.longestWinStreak || 0,

			updatedAt: new Date(),
		};

		// Calculate win rates and averages
		const totalGames = updates.totalGamesPlayed!;
		const connect3Games = isConnect3
			? updates.connect3GamesPlayed!
			: stats?.connect3GamesPlayed || 0;
		const classicGames = isClassic
			? updates.classicGamesPlayed!
			: stats?.classicGamesPlayed || 0;

		if (totalGames > 0) {
			updates.averageScore = updates.totalScore! / totalGames;
		}

		if (connect3Games > 0) {
			updates.connect3WinRate =
				(updates.connect3Wins || stats?.connect3Wins || 0) / connect3Games;
			updates.connect3AverageScore =
				(updates.connect3TotalScore || stats?.connect3TotalScore || 0) /
				connect3Games;
		}

		if (classicGames > 0) {
			updates.classicWinRate =
				(updates.classicWins || stats?.classicWins || 0) / classicGames;
			updates.classicAverageScore =
				(updates.classicTotalScore || stats?.classicTotalScore || 0) /
				classicGames;
		}

		await db
			.update(playerStats)
			.set(updates)
			.where(eq(playerStats.playerId, playerId));
	}

	static async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
		const [stats] = await db
			.select()
			.from(playerStats)
			.where(eq(playerStats.playerId, playerId));

		return stats || null;
	}

	// Leaderboards
	static async updateLeaderboards(): Promise<void> {
		// Update global leaderboard
		await this.updateGlobalLeaderboard();

		// Update game-specific leaderboards
		await this.updateGameVariantLeaderboard('connect3');
		await this.updateGameVariantLeaderboard('classic');
	}

	private static async updateGlobalLeaderboard(): Promise<void> {
		// Clear existing global leaderboard
		await db.delete(leaderboards).where(eq(leaderboards.category, 'global'));

		// Get top players by total score
		const topPlayers = await db
			.select({
				playerId: playerStats.playerId,
				totalScore: playerStats.totalScore,
				gamesPlayed: playerStats.totalGamesPlayed,
				winRate: sql<number>`CASE WHEN ${playerStats.totalGamesPlayed} > 0 THEN CAST(${playerStats.totalWins} AS REAL) / ${playerStats.totalGamesPlayed} ELSE 0 END`,
			})
			.from(playerStats)
			.where(sql`${playerStats.totalGamesPlayed} > 0`)
			.orderBy(desc(playerStats.totalScore))
			.limit(100);

		// Insert new leaderboard entries
		const leaderboardEntries = topPlayers.map((player, index) => ({
			id: generateId(),
			category: 'global' as const,
			period: 'all_time' as const,
			playerId: player.playerId,
			score: player.totalScore,
			rank: index + 1,
			gamesPlayed: player.gamesPlayed,
			winRate: player.winRate,
		}));

		if (leaderboardEntries.length > 0) {
			await db.insert(leaderboards).values(leaderboardEntries);
		}
	}

	private static async updateGameVariantLeaderboard(
		variant: 'connect3' | 'classic'
	): Promise<void> {
		// Clear existing leaderboard for this variant
		await db.delete(leaderboards).where(eq(leaderboards.category, variant));

		const scoreField =
			variant === 'connect3'
				? playerStats.connect3TotalScore
				: playerStats.classicTotalScore;
		const gamesField =
			variant === 'connect3'
				? playerStats.connect3GamesPlayed
				: playerStats.classicGamesPlayed;
		const winsField =
			variant === 'connect3'
				? playerStats.connect3Wins
				: playerStats.classicWins;

		// Get top players for this variant
		const topPlayers = await db
			.select({
				playerId: playerStats.playerId,
				totalScore: scoreField,
				gamesPlayed: gamesField,
				winRate: sql<number>`CASE WHEN ${gamesField} > 0 THEN CAST(${winsField} AS REAL) / ${gamesField} ELSE 0 END`,
			})
			.from(playerStats)
			.where(sql`${gamesField} > 0`)
			.orderBy(desc(scoreField))
			.limit(100);

		// Insert new leaderboard entries
		const leaderboardEntries = topPlayers.map((player, index) => ({
			id: generateId(),
			category: variant,
			period: 'all_time' as const,
			playerId: player.playerId,
			score: player.totalScore,
			rank: index + 1,
			gamesPlayed: player.gamesPlayed,
			winRate: player.winRate,
		}));

		if (leaderboardEntries.length > 0) {
			await db.insert(leaderboards).values(leaderboardEntries);
		}
	}

	static async getLeaderboard(category: string, limit = 20): Promise<any[]> {
		return await db
			.select({
				rank: leaderboards.rank,
				player: {
					id: players.id,
					name: players.name,
					avatar: players.avatar,
				},
				score: leaderboards.score,
				gamesPlayed: leaderboards.gamesPlayed,
				winRate: leaderboards.winRate,
			})
			.from(leaderboards)
			.innerJoin(players, eq(leaderboards.playerId, players.id))
			.where(eq(leaderboards.category, category))
			.orderBy(asc(leaderboards.rank))
			.limit(limit);
	}

	// Analytics and insights
	static async getPlayerInsights(playerId: string): Promise<any> {
		const stats = await this.getPlayerStats(playerId);
		const recentGames = await this.getPlayerGameHistory(playerId, 10);
		const achievements = await this.getPlayerAchievements(playerId);

		return {
			stats,
			recentGames,
			achievements,
			insights: {
				favoriteGameMode:
					(stats?.connect3GamesPlayed ?? 0) > (stats?.classicGamesPlayed ?? 0)
						? 'connect3'
						: 'classic',
				averageGameDuration:
					(stats?.totalGamesPlayed ?? 0) > 0
						? (stats?.totalPlayTime ?? 0) / (stats?.totalGamesPlayed ?? 1)
						: 0,
				matchesPerGame:
					(stats?.totalGamesPlayed ?? 0) > 0
						? (stats?.totalMatches ?? 0) / (stats?.totalGamesPlayed ?? 1)
						: 0,
				cascadeEfficiency:
					(stats?.totalMatches ?? 0) > 0
						? (stats?.totalCascades ?? 0) / (stats?.totalMatches ?? 1)
						: 0,
			},
		};
	}
}

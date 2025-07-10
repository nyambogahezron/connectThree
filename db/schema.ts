import {
	sqliteTable,
	text,
	integer,
	real,
	primaryKey,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const players = sqliteTable('players', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	avatar: text('avatar'),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const gameSessions = sqliteTable('game_sessions', {
	id: text('id').primaryKey(),
	gameVariant: text('game_variant').notNull(), // 'connect3' | 'classic'
	gameMode: text('game_mode').notNull(), // 'pvp' | 'ai'
	aiDifficulty: text('ai_difficulty'), // 'easy' | 'medium' | 'hard'
	status: text('status').notNull().default('active'), // 'active' | 'completed' | 'abandoned'
	startedAt: integer('started_at', { mode: 'timestamp' }),
	completedAt: integer('completed_at', { mode: 'timestamp' }),
	duration: integer('duration'), // in seconds
	totalMoves: integer('total_moves').default(0),
	winner: text('winner'), // player_id or 'draw'
	winType: text('win_type'), // 'regular' | 'king' | 'timeout'
});

export const playerScores = sqliteTable('player_scores', {
	id: text('id').primaryKey(),
	sessionId: text('session_id')
		.notNull()
		.references(() => gameSessions.id, { onDelete: 'cascade' }),
	playerId: text('player_id')
		.notNull()
		.references(() => players.id, { onDelete: 'cascade' }),
	playerColor: text('player_color').notNull(), // 'red' | 'yellow'
	finalScore: integer('final_score').notNull().default(0),
	basePoints: integer('base_points').notNull().default(0),
	bonusPoints: integer('bonus_points').notNull().default(0),
	cascadePoints: integer('cascade_points').notNull().default(0),
	achievementPoints: integer('achievement_points').notNull().default(0),
	totalMatches: integer('total_matches').notNull().default(0),
	maxCascadeLevel: integer('max_cascade_level').notNull().default(0),
	kingsCreated: integer('kings_created').notNull().default(0),
	movesUsed: integer('moves_used').notNull().default(0),
	rank: integer('rank'), // 1 for winner, 2 for loser, null for draw
});

// Individual scoring events during gameplay
export const scoreEvents = sqliteTable('score_events', {
	id: text('id').primaryKey(),
	sessionId: text('session_id')
		.notNull()
		.references(() => gameSessions.id, { onDelete: 'cascade' }),
	playerId: text('player_id')
		.notNull()
		.references(() => players.id, { onDelete: 'cascade' }),
	eventType: text('event_type').notNull(), // 'match' | 'cascade' | 'achievement' | 'bonus'
	points: integer('points').notNull(),
	multiplier: real('multiplier').notNull().default(1.0),
	description: text('description').notNull(),
	matchSize: integer('match_size'),
	cascadeLevel: integer('cascade_level'),
	isKingMatch: integer('is_king_match', { mode: 'boolean' }).default(false),
	simultaneousMatches: integer('simultaneous_matches').default(1),
	moveNumber: integer('move_number').notNull(),
	timestamp: integer('timestamp', { mode: 'timestamp' }),
});

export const playerAchievements = sqliteTable(
	'player_achievements',
	{
		id: text('id').notNull().unique(),
		playerId: text('player_id')
			.notNull()
			.references(() => players.id, { onDelete: 'cascade' }),
		achievementId: text('achievement_id').notNull(),
		achievementName: text('achievement_name').notNull(),
		achievementDescription: text('achievement_description').notNull(),
		points: integer('points').notNull(),
		unlockedAt: integer('unlocked_at', { mode: 'timestamp' }),
		sessionId: text('session_id').references(() => gameSessions.id, {
			onDelete: 'set null',
		}),
	},
	(table) => [primaryKey({ columns: [table.playerId, table.achievementId] })]
);

export const playerStats = sqliteTable('player_stats', {
	playerId: text('player_id')
		.primaryKey()
		.references(() => players.id, { onDelete: 'cascade' }),
	// Connect3 stats
	connect3GamesPlayed: integer('connect3_games_played').notNull().default(0),
	connect3Wins: integer('connect3_wins').notNull().default(0),
	connect3Losses: integer('connect3_losses').notNull().default(0),
	connect3Draws: integer('connect3_draws').notNull().default(0),
	connect3WinRate: real('connect3_win_rate').notNull().default(0),
	connect3HighScore: integer('connect3_high_score').notNull().default(0),
	connect3TotalScore: integer('connect3_total_score').notNull().default(0),
	connect3AverageScore: real('connect3_average_score').notNull().default(0),

	// Classic mode stats
	classicGamesPlayed: integer('classic_games_played').notNull().default(0),
	classicWins: integer('classic_wins').notNull().default(0),
	classicLosses: integer('classic_losses').notNull().default(0),
	classicDraws: integer('classic_draws').notNull().default(0),
	classicWinRate: real('classic_win_rate').notNull().default(0),
	classicHighScore: integer('classic_high_score').notNull().default(0),
	classicTotalScore: integer('classic_total_score').notNull().default(0),
	classicAverageScore: real('classic_average_score').notNull().default(0),

	// Overall stats
	totalGamesPlayed: integer('total_games_played').notNull().default(0),
	totalWins: integer('total_wins').notNull().default(0),
	totalScore: integer('total_score').notNull().default(0),
	averageScore: real('average_score').notNull().default(0),
	longestWinStreak: integer('longest_win_streak').notNull().default(0),
	currentWinStreak: integer('current_win_streak').notNull().default(0),
	totalPlayTime: integer('total_play_time').notNull().default(0), // in seconds
	achievementsUnlocked: integer('achievements_unlocked').notNull().default(0),

	// Advanced stats
	totalMatches: integer('total_matches').notNull().default(0),
	totalCascades: integer('total_cascades').notNull().default(0),
	maxCascadeInGame: integer('max_cascade_in_game').notNull().default(0),
	totalKingsCreated: integer('total_kings_created').notNull().default(0),
	perfectGames: integer('perfect_games').notNull().default(0),

	// Rankings
	globalRank: integer('global_rank'),
	connect3Rank: integer('connect3_rank'),
	classicRank: integer('classic_rank'),

	updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const leaderboards = sqliteTable('leaderboards', {
	id: text('id').primaryKey(),
	category: text('category').notNull(), // 'global' | 'connect3' | 'classic' | 'weekly' | 'monthly'
	period: text('period'), // 'all_time' | 'weekly' | 'monthly' | 'daily'
	playerId: text('player_id')
		.notNull()
		.references(() => players.id, { onDelete: 'cascade' }),
	score: integer('score').notNull(),
	rank: integer('rank').notNull(),
	gamesPlayed: integer('games_played').notNull(),
	winRate: real('win_rate').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type PlayerScore = typeof playerScores.$inferSelect;
export type NewPlayerScore = typeof playerScores.$inferInsert;
export type ScoreEvent = typeof scoreEvents.$inferSelect;
export type NewScoreEvent = typeof scoreEvents.$inferInsert;
export type PlayerAchievement = typeof playerAchievements.$inferSelect;
export type NewPlayerAchievement = typeof playerAchievements.$inferInsert;
export type PlayerStats = typeof playerStats.$inferSelect;
export type NewPlayerStats = typeof playerStats.$inferInsert;
export type Leaderboard = typeof leaderboards.$inferSelect;
export type NewLeaderboard = typeof leaderboards.$inferInsert;

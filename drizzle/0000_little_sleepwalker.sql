CREATE TABLE `game_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`game_variant` text NOT NULL,
	`game_mode` text NOT NULL,
	`ai_difficulty` text,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`duration` integer,
	`total_moves` integer DEFAULT 0,
	`winner` text,
	`win_type` text
);
--> statement-breakpoint
CREATE TABLE `leaderboards` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`period` text,
	`player_id` text NOT NULL,
	`score` integer NOT NULL,
	`rank` integer NOT NULL,
	`games_played` integer NOT NULL,
	`win_rate` real NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `player_achievements` (
	`id` text NOT NULL,
	`player_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`achievement_name` text NOT NULL,
	`achievement_description` text NOT NULL,
	`points` integer NOT NULL,
	`unlocked_at` integer,
	`session_id` text,
	PRIMARY KEY(`player_id`, `achievement_id`),
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_achievements_id_unique` ON `player_achievements` (`id`);--> statement-breakpoint
CREATE TABLE `player_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`player_id` text NOT NULL,
	`player_color` text NOT NULL,
	`final_score` integer DEFAULT 0 NOT NULL,
	`base_points` integer DEFAULT 0 NOT NULL,
	`bonus_points` integer DEFAULT 0 NOT NULL,
	`cascade_points` integer DEFAULT 0 NOT NULL,
	`achievement_points` integer DEFAULT 0 NOT NULL,
	`total_matches` integer DEFAULT 0 NOT NULL,
	`max_cascade_level` integer DEFAULT 0 NOT NULL,
	`kings_created` integer DEFAULT 0 NOT NULL,
	`moves_used` integer DEFAULT 0 NOT NULL,
	`rank` integer,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `player_stats` (
	`player_id` text PRIMARY KEY NOT NULL,
	`connect3_games_played` integer DEFAULT 0 NOT NULL,
	`connect3_wins` integer DEFAULT 0 NOT NULL,
	`connect3_losses` integer DEFAULT 0 NOT NULL,
	`connect3_draws` integer DEFAULT 0 NOT NULL,
	`connect3_win_rate` real DEFAULT 0 NOT NULL,
	`connect3_high_score` integer DEFAULT 0 NOT NULL,
	`connect3_total_score` integer DEFAULT 0 NOT NULL,
	`connect3_average_score` real DEFAULT 0 NOT NULL,
	`classic_games_played` integer DEFAULT 0 NOT NULL,
	`classic_wins` integer DEFAULT 0 NOT NULL,
	`classic_losses` integer DEFAULT 0 NOT NULL,
	`classic_draws` integer DEFAULT 0 NOT NULL,
	`classic_win_rate` real DEFAULT 0 NOT NULL,
	`classic_high_score` integer DEFAULT 0 NOT NULL,
	`classic_total_score` integer DEFAULT 0 NOT NULL,
	`classic_average_score` real DEFAULT 0 NOT NULL,
	`total_games_played` integer DEFAULT 0 NOT NULL,
	`total_wins` integer DEFAULT 0 NOT NULL,
	`total_score` integer DEFAULT 0 NOT NULL,
	`average_score` real DEFAULT 0 NOT NULL,
	`longest_win_streak` integer DEFAULT 0 NOT NULL,
	`current_win_streak` integer DEFAULT 0 NOT NULL,
	`total_play_time` integer DEFAULT 0 NOT NULL,
	`achievements_unlocked` integer DEFAULT 0 NOT NULL,
	`total_matches` integer DEFAULT 0 NOT NULL,
	`total_cascades` integer DEFAULT 0 NOT NULL,
	`max_cascade_in_game` integer DEFAULT 0 NOT NULL,
	`total_kings_created` integer DEFAULT 0 NOT NULL,
	`perfect_games` integer DEFAULT 0 NOT NULL,
	`global_rank` integer,
	`connect3_rank` integer,
	`classic_rank` integer,
	`updated_at` integer,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `score_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`player_id` text NOT NULL,
	`event_type` text NOT NULL,
	`points` integer NOT NULL,
	`multiplier` real DEFAULT 1 NOT NULL,
	`description` text NOT NULL,
	`match_size` integer,
	`cascade_level` integer,
	`is_king_match` integer DEFAULT false,
	`simultaneous_matches` integer DEFAULT 1,
	`move_number` integer NOT NULL,
	`timestamp` integer,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);

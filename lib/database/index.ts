import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as schema from './schema';

// Open database
const expo = openDatabaseSync('connect3.db', { enableChangeListener: true });

// Create drizzle instance
export const db = drizzle(expo, { schema });

// Run migrations
export const runMigrations = async () => {
  try {
    await migrate(db, { migrationsFolder: './lib/database/migrations' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
};

// Initialize database
export const initializeDatabase = async () => {
  try {
    await runMigrations();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export { schema };
export * from './schema';
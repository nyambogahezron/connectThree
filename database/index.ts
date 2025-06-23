import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const expo = openDatabaseSync('connect3.db', { enableChangeListener: true });

export const db = drizzle(expo, { schema });

export { schema };
export * from './schema';

import { useState, useEffect } from 'react';
import { db } from '@/db';
import { players } from '@/db/schema';

/**
 * Hook to check if the database is ready by verifying that tables exist
 */
export const useDatabaseReady = () => {
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const checkDatabase = async () => {
			try {
				// Try to perform a simple query to check if tables exist
				await db.select().from(players).limit(1);
				setIsReady(true);
				setError(null);
				console.log('✅ Database is ready');
			} catch (err) {
				console.log('⏳ Database not ready yet, retrying...', err);
				setError(err as Error);
				// Retry after a short delay
				setTimeout(() => {
					checkDatabase();
				}, 1000);
			}
		};

		checkDatabase();
	}, []);

	return { isReady, error };
};

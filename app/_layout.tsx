import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
	Orbitron_400Regular,
	Orbitron_700Bold,
	Orbitron_900Black,
} from '@expo-google-fonts/orbitron';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import * as SplashScreen from 'expo-splash-screen';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import migrations from '../drizzle/migrations';
import { db } from '@/db';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const [appIsReady, setAppIsReady] = React.useState(false);
	const { success, error } = useMigrations(db, migrations);

	// Move useFonts to the top level - hooks must be called in the same order every time
	const [fontsLoaded, fontError] = useFonts({
		'Orbitron-Regular': Orbitron_400Regular,
		'Orbitron-Bold': Orbitron_700Bold,
		'Orbitron-Black': Orbitron_900Black,
		'PressStart2P-Regular': PressStart2P_400Regular,
	});

	useDrizzleStudio(db.$client);

	React.useEffect(() => {
		const prepare = async () => {
			// Log migration status
			console.log('Migration status:', { success, error });

			// Wait for migrations to complete successfully
			if (success === true && fontsLoaded && !error) {
				console.log('✅ Migrations and fonts loaded successfully');
				setAppIsReady(true);
			} else if (error) {
				console.error('❌ Migration error:', error);
				// Don't set ready if migrations failed - this is critical
			} else if (fontError) {
				console.warn('⚠️ Font loading error:', fontError);
				// Fonts are not critical, allow app to start if migrations succeeded
				if (success === true) {
					setAppIsReady(true);
				}
			} else if (success === false) {
				console.log('⏳ Migrations still running...');
			}
		};

		prepare();
	}, [success, error, fontsLoaded, fontError]);

	const onLayoutRootView = React.useCallback(() => {
		if (appIsReady) {
			SplashScreen.hide();
		}
	}, [appIsReady]);

	if (!appIsReady) {
		return null;
	}

	return (
		<View style={{ flex: 1 }} onLayout={onLayoutRootView}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name='onboarding' options={{ headerShown: false }} />
				<Stack.Screen name='terms' options={{ headerShown: false }} />
				<Stack.Screen name='tutorial' options={{ headerShown: false }} />
				<Stack.Screen name='(home)' options={{ headerShown: false }} />
				<Stack.Screen name='+not-found' />
			</Stack>
			<StatusBar style='auto' />
		</View>
	);
}

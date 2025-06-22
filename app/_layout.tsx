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
import { initializeDatabase } from '@/lib/database';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const [appIsReady, setAppIsReady] = React.useState(false);

	React.useEffect(() => {
		async function prepare() {
			// initialize database
			await initializeDatabase();
			try {
				const [fontsLoaded, fontError] = useFonts({
					'Orbitron-Regular': Orbitron_400Regular,
					'Orbitron-Bold': Orbitron_700Bold,
					'Orbitron-Black': Orbitron_900Black,
					'PressStart2P-Regular': PressStart2P_400Regular,
				});
			} catch (e) {
				console.warn(e);
			} finally {
				setAppIsReady(true);
			}
		}

		prepare();
	}, []);

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

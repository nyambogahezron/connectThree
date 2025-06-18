import { useEffect } from 'react';
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		'Orbitron-Regular': Orbitron_400Regular,
		'Orbitron-Bold': Orbitron_700Bold,
		'Orbitron-Black': Orbitron_900Black,
		'PressStart2P-Regular': PressStart2P_400Regular,
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name='onboarding' options={{ headerShown: false }} />
				<Stack.Screen name='terms' options={{ headerShown: false }} />
				<Stack.Screen name='tutorial' options={{ headerShown: false }} />
				<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
				<Stack.Screen name='+not-found' />
			</Stack>
			<StatusBar style='auto' />
		</>
	);
}

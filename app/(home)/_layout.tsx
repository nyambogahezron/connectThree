import React from 'react';
import { Stack } from 'expo-router';

export default function HomeLayout() {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					title: 'Home',
					headerStyle: { backgroundColor: '#f4511e' },
					headerTintColor: '#fff',
					headerTitleStyle: { fontWeight: 'bold' },
				}}
			/>
			<Stack.Screen
				name='settings'
				options={{
					title: 'Settings',
					headerStyle: { backgroundColor: '#f4511e' },
					headerTintColor: '#fff',
					headerTitleStyle: { fontWeight: 'bold' },
				}}
			/>
			<Stack.Screen
				name='leaderboard'
				options={{
					title: 'Leaderboard"',
					headerStyle: { backgroundColor: '#f4511e' },
					headerTintColor: '#fff',
					headerTitleStyle: { fontWeight: 'bold' },
				}}
			/>
		</Stack>
	);
}
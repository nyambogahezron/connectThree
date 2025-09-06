import React from 'react';
import { Stack } from 'expo-router';
import { HeaderMenu } from '@/components/HeaderMenu';

export default function HomeLayout() {
	return (
		<Stack>
			<Stack.Screen
				name='index'
				options={{
					title: 'Connect 3',
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
					headerRight: () => <HeaderMenu tintColor='#fff' />,
				}}
			/>
			<Stack.Screen
				name='leaderboard'
				options={{
					title: 'Leaderboard',
					headerStyle: { backgroundColor: '#f4511e' },
					headerTintColor: '#fff',
					headerTitleStyle: { fontWeight: 'bold' },
					headerRight: () => <HeaderMenu tintColor='#fff' />,
				}}
			/>
		</Stack>
	);
}

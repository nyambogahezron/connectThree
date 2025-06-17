import { Tabs } from 'expo-router';
import { Gamepad as GamepadIcon, Trophy, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1a1a1a',
          height: 100,
        },
        headerTitleStyle: {
          display: 'none',
        },
        headerTintColor: '#ffffff',
        tabBarStyle: {
          display: 'none',
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerRight: () => (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 20, 
              paddingRight: 20 
            }}>
              <GamepadIcon size={24} color="#4f46e5" />
              <Trophy size={24} color="#888" />
              <Settings size={24} color="#888" />
            </div>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          headerRight: () => (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 20, 
              paddingRight: 20 
            }}>
              <GamepadIcon size={24} color="#888" />
              <Trophy size={24} color="#4f46e5" />
              <Settings size={24} color="#888" />
            </div>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerRight: () => (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 20, 
              paddingRight: 20 
            }}>
              <GamepadIcon size={24} color="#888" />
              <Trophy size={24} color="#888" />
              <Settings size={24} color="#4f46e5" />
            </div>
          ),
        }}
      />
    </Tabs>
  );
}
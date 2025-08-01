import { Tabs } from 'expo-router';
import { Eye, Activity, Server, Settings, Brain } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0C0C0C',
          borderTopColor: '#FF2EC0',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00FFF7',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono-Regular',
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'FEED',
          tabBarIcon: ({ size, color }) => (
            <Eye size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="servers"
        options={{
          title: 'SERVERS',
          tabBarIcon: ({ size, color }) => (
            <Server size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'LOGS',
          tabBarIcon: ({ size, color }) => (
            <Activity size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="possession"
        options={{
          title: 'HIJACK',
          tabBarIcon: ({ size, color }) => (
            <Brain size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'CONFIG',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
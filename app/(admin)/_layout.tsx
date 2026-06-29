import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.4, textAlign: 'center' }}>
      {emoji}
    </Text>
  );
}

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: true,
      tabBarActiveTintColor: Colors.primary.green,
      tabBarInactiveTintColor: Colors.neutral.gray,
      tabBarLabelStyle: { fontFamily: Typography.fontFamily.medium, fontSize: 10 },
      tabBarStyle: {
        backgroundColor: Colors.neutral.white,
        borderTopWidth: 1, borderTopColor: Colors.neutral.lightGray,
        height: Platform.OS === 'ios' ? 82 : 64,
        paddingBottom: Platform.OS === 'ios' ? 20 : 6,
        paddingTop: 4,
      },
    }}>
      <Tabs.Screen name="dashboard"  options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon emoji="🏪" label="Dashboard" focused={focused} /> }} />
      <Tabs.Screen name="collectors" options={{ title: 'Collectors', tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Collectors" focused={focused} /> }} />
      <Tabs.Screen name="reports"    options={{ title: 'Reports',   tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Reports" focused={focused} /> }} />
      <Tabs.Screen name="settings"   options={{ title: 'Settings',  tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" label="Settings" focused={focused} /> }} />
    </Tabs>
  );
}

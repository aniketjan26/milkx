import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 6 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
      <Text style={{ fontFamily: focused ? Typography.fontFamily.semibold : Typography.fontFamily.medium, fontSize: 10, color: focused ? Colors.primary.green : Colors.neutral.gray, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function FarmerLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: Colors.neutral.white,
        borderTopWidth: 1, borderTopColor: Colors.neutral.lightGray,
        height: Platform.OS === 'ios' ? 82 : 64,
        paddingBottom: Platform.OS === 'ios' ? 20 : 6,
        paddingTop: 4,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06, shadowRadius: 8,
      },
    }}>
      <Tabs.Screen name="dashboard" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="history"   options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="History" focused={focused} /> }} />
      <Tabs.Screen name="wallet"    options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💳" label="Wallet" focused={focused} /> }} />
      <Tabs.Screen name="profile"   options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

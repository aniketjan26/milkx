import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={ti.wrap}>
      <Text style={[ti.emoji, focused && ti.emojiActive]}>{emoji}</Text>
      <Text style={[ti.label, focused && ti.labelActive]} numberOfLines={1}>{label}</Text>
      <View style={[ti.dot, focused && ti.dotActive]} />
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  emoji: { fontSize: 22, opacity: 0.4 },
  emojiActive: { opacity: 1 },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.neutral.gray,
    marginTop: 3,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.primary.green,
    fontFamily: Typography.fontFamily.semibold,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent', marginTop: 3 },
  dotActive: { backgroundColor: Colors.primary.green },
});

export default function CollectorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: { paddingVertical: 0, paddingHorizontal: 0 },
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.lightGray,
          height: Platform.OS === 'ios' ? 90 : 76,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="farmers"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌾" label="Farmers" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="milk-entry"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[fab.wrap, focused && fab.wrapActive]}>
              <Text style={fab.icon}>🥛</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Payments" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const fab = StyleSheet.create({
  wrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.neutral.lightGray,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  wrapActive: { backgroundColor: Colors.primary.green },
  icon: { fontSize: 24 },
});

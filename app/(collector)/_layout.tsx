import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[ti.wrap, focused && ti.wrapActive]}>
      <Text style={[ti.emoji, focused && ti.emojiActive]}>{emoji}</Text>
      <Text style={[ti.label, focused && ti.labelActive]}>{label}</Text>
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 6, paddingHorizontal: 12, paddingBottom: 2, borderRadius: BorderRadius.lg },
  wrapActive: { },
  emoji: { fontSize: 20, opacity: 0.45 },
  emojiActive: { opacity: 1 },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: 10, color: Colors.neutral.gray, marginTop: 2 },
  labelActive: { color: Colors.primary.green, fontFamily: Typography.fontFamily.semibold },
});

export default function CollectorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.lightGray,
          height: Platform.OS === 'ios' ? 82 : 64,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          paddingTop: 4,
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
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: Colors.neutral.lightGray,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    shadowColor: Colors.primary.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  wrapActive: {
    backgroundColor: Colors.primary.green,
  },
  icon: { fontSize: 24 },
});

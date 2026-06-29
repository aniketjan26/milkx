import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

export default function CollectorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.green,
        tabBarInactiveTintColor: Colors.neutral.gray,
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.semibold,
          fontSize: 11,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: { marginTop: 4 },
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.lightGray,
          height: Platform.OS === 'ios' ? 90 : 76,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 6,
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
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="farmers"
        options={{
          tabBarLabel: 'Farmers',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🌾</Text>,
        }}
      />
      <Tabs.Screen
        name="milk-entry"
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={[fab.wrap, focused && fab.wrapActive]}>
              <Text style={{ fontSize: 24 }}>🥛</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          tabBarLabel: 'Payments',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
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
    marginBottom: Platform.OS === 'ios' ? 10 : 14,
    shadowColor: Colors.primary.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  wrapActive: { backgroundColor: Colors.primary.green },
});

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
const titles: Record<string, string> = { collectors: 'Manage Collectors', reports: 'Reports', settings: 'Settings' };
export default function AdminScreen() {
  const name = 'reports';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral.offWhite }}>
      <View style={{ backgroundColor: Colors.primary.green, padding: Spacing.xl, paddingBottom: Spacing['2xl'] }}>
        <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' }}>{titles[name] ?? name}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, alignItems: 'center', paddingTop: Spacing['4xl'] }}>
        <Text style={{ fontSize: 48 }}>🚧</Text>
        <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal, marginTop: Spacing.md }}>Coming Soon</Text>
        <Text style={{ fontFamily: Typography.fontFamily.regular, color: Colors.neutral.gray, textAlign: 'center', marginTop: Spacing.sm }}>This section is under development</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

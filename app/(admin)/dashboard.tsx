import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { formatINR } from '../../src/utils/calculations';
const STATS = [
  { label: 'Total Collections', value: '24', color: Colors.primary.green },
  { label: 'Total Farmers', value: '512', color: Colors.sky.blue },
  { label: "Today's Milk", value: '1,245 L', color: Colors.accent.amber },
  { label: "Today's Amount", value: formatINR(45680), color: '#8B5CF6' },
];
export default function AdminDashboard() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral.offWhite }}>
      <View style={{ backgroundColor: Colors.primary.green, padding: Spacing.xl, paddingBottom: Spacing['2xl'] }}>
        <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' }}>Admin Dashboard</Text>
        <Text style={{ fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Milk Store Dashboard</Text>
      </View>
      <ScrollView style={{ padding: Spacing.xl }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
          {STATS.map(s => (
            <View key={s.label} style={{ width: '47%', backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.base, borderLeftWidth: 4, borderLeftColor: s.color, ...Shadows.card }}>
              <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: s.color }}>{s.value}</Text>
              <Text style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

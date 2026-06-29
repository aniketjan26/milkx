import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { formatINR } from '../../src/utils/calculations';
export default function FarmerDashboard() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral.offWhite }}>
      <View style={{ backgroundColor: Colors.primary.green, padding: Spacing.xl, paddingBottom: Spacing['2xl'] }}>
        <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' }}>Farmer Dashboard</Text>
        <Text style={{ fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Ramesh Kumar · FAR001</Text>
      </View>
      <ScrollView style={{ padding: Spacing.xl }}>
        <View style={{ backgroundColor: '#6B21A8', borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.md, ...Shadows.elevated }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm }}>Current Balance</Text>
          <Text style={{ color: '#fff', fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['3xl'], marginTop: 4 }}>{formatINR(5000)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <View style={{ flex: 1, backgroundColor: Colors.primary.lightGreen, borderRadius: BorderRadius.lg, padding: Spacing.base }}>
            <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.primary.green }}>30.0 L</Text>
            <Text style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, marginTop: 2 }}>Today's Collection</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFF8E1', borderRadius: BorderRadius.lg, padding: Spacing.base }}>
            <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.accent.amber }}>{formatINR(1050)}</Text>
            <Text style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, marginTop: 2 }}>Today's Amount</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

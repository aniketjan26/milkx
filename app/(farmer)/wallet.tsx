import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { formatINR } from '../../src/utils/calculations';
export default function FarmerWallet() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral.offWhite }}>
      <View style={{ backgroundColor: Colors.primary.green, padding: Spacing.xl, paddingBottom: Spacing['2xl'] }}>
        <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' }}>My Wallet</Text>
      </View>
      <ScrollView style={{ padding: Spacing.xl }}>
        <View style={{ backgroundColor: '#6B21A8', borderRadius: BorderRadius.lg, padding: Spacing.xl, ...Shadows.elevated }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm }}>Current Balance</Text>
          <Text style={{ color: '#fff', fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['3xl'], marginTop: 4 }}>{formatINR(0)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

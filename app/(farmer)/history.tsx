import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
export default function FarmerHistory() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral.offWhite }}>
      <View style={{ backgroundColor: Colors.primary.green, padding: Spacing.xl, paddingBottom: Spacing['2xl'] }}>
        <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' }}>My Records</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: Typography.fontFamily.regular, marginTop: 2 }}>Milk collection history</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, alignItems: 'center', paddingTop: Spacing['4xl'] }}>
        <Text style={{ fontSize: 48 }}>📋</Text>
        <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal, marginTop: Spacing.md }}>No records yet</Text>
        <Text style={{ fontFamily: Typography.fontFamily.regular, color: Colors.neutral.gray, textAlign: 'center', marginTop: Spacing.sm }}>Your milk collection history will appear here</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

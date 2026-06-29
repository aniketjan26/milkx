import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';

const TYPES = [
  { type: 'admin',     emoji: '🏪', title: 'Milk Store / Dairy', sub: 'Manage your dairy business',       color: Colors.primary.green },
  { type: 'collector', emoji: '👨‍💼', title: 'Collector',          sub: 'Collect milk & manage farmers',   color: '#2196F3' },
  { type: 'farmer',    emoji: '🌾', title: 'Farmer',             sub: 'View your collection & payments', color: Colors.accent.wheat },
];

export default function UserTypeScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.logoRow}>
          <Text style={{ fontSize: 28 }}>🥛</Text>
          <Text style={s.appName}>MilkX</Text>
        </View>
        <Text style={s.title}>Welcome Back</Text>
        <Text style={s.sub}>Choose how you want to continue</Text>
      </View>
      <View style={s.body}>
        {TYPES.map((t) => (
          <TouchableOpacity key={t.type} style={s.card} onPress={() => router.push({ pathname: '/(auth)/login', params: { role: t.type } })} activeOpacity={0.7}>
            <View style={[s.icon, { backgroundColor: t.color + '18' }]}><Text style={{ fontSize: 28 }}>{t.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{t.title}</Text>
              <Text style={s.cardSub}>{t.sub}</Text>
            </View>
            <View style={[s.arrow, { backgroundColor: t.color }]}><Text style={{ color: '#fff', fontSize: 20 }}>›</Text></View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: Colors.primary.green, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing['2xl'], borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  appName: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: '#fff' },
  title: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' },
  sub: { fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.75)', fontSize: Typography.size.base, marginTop: 2 },
  body: { padding: Spacing.xl, gap: Spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral.offWhite, borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.neutral.lightGray, ...Shadows.card },
  icon: { width: 54, height: 54, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.base },
  cardTitle: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.neutral.charcoal },
  cardSub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray, marginTop: 2 },
  arrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

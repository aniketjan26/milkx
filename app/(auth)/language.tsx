import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import type { Language } from '../../src/types';

const LANGS = [
  { code: 'en' as Language, label: 'English', native: 'English' },
  { code: 'hi' as Language, label: 'Hindi', native: 'हिंदी' },
  { code: 'pa' as Language, label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export default function LanguageScreen() {
  const { setLanguage } = useAuthStore();
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.logo}><Text style={{ fontSize: 44 }}>🥛</Text></View>
        <Text style={s.appName}>MilkX</Text>
        <Text style={s.tagline}>Smart Milk Collection{'\n'}for a Better Tomorrow</Text>
      </View>
      <View style={s.card}>
        <Text style={s.title}>Choose Language</Text>
        <Text style={s.subtitle}>Select your preferred language</Text>
        {LANGS.map((l) => (
          <TouchableOpacity key={l.code} style={s.row} onPress={() => { setLanguage(l.code); router.push('/(auth)/user-type'); }} activeOpacity={0.7}>
            <View style={s.badge}><Text style={s.badgeText}>{l.code.toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.langLabel}>{l.label}</Text>
              <Text style={s.langNative}>{l.native}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.green },
  header: { alignItems: 'center', paddingTop: Spacing['3xl'], paddingBottom: Spacing['2xl'] },
  logo: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, ...Shadows.elevated },
  appName: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['4xl'], color: '#fff' },
  tagline: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: Spacing.xs, lineHeight: 20 },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },
  title: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: Colors.neutral.charcoal },
  subtitle: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.neutral.gray, marginBottom: Spacing['2xl'], marginTop: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral.offWhite, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.neutral.lightGray },
  badge: { width: 46, height: 46, borderRadius: BorderRadius.md, backgroundColor: Colors.primary.lightGreen, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.base },
  badgeText: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.sm, color: Colors.primary.green },
  langLabel: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.neutral.charcoal },
  langNative: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray },
  chevron: { fontSize: 26, color: Colors.neutral.midGray },
});

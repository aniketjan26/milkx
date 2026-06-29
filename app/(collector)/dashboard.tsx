import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { formatINR } from '../../src/utils/calculations';
import { getDashboardStats } from '@/services/service';

interface Stats {
  totalFarmers: number;
  todaysMilkLiters: number;
  todaysAmount: number;
  todaysEntries: { entry: { id: string; volume: number; totalAmount: number; createdAt: string }; farmer: { name: string } }[];
  weeklyTrend: { date: string; liters: number; amount: number }[];
}

export default function Dashboard() {
  const { user, language, setLanguage } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const LANGS = [
    { code: 'en' as const, label: 'English', native: 'English' },
    { code: 'hi' as const, label: 'Hindi', native: 'हिंदी' },
    { code: 'pa' as const, label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ];

  const collectorId = user?.collectorId ?? '';

  async function loadStats() {
    if (!collectorId) return;
    try {
      const data = await getDashboardStats(collectorId);
      setStats(data as any);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Reload every time the tab comes into focus (e.g. after adding milk entry)
  useFocusEffect(useCallback(() => { loadStats(); }, [collectorId]));

  async function onRefresh() { setRefreshing(true); await loadStats(); }

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary.green} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greeting}, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={s.id}>Collector ID: {user?.collectorId}</Text>
          </View>
          <TouchableOpacity style={s.langBtn} onPress={() => setShowLangPicker(true)}>
            <Text style={s.langBtnText}>{(language ?? 'en').toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.bell}><Text style={{ fontSize: 18 }}>🔔</Text></TouchableOpacity>
        </View>

        {/* Language Picker Modal */}
        <Modal visible={showLangPicker} transparent animationType="fade">
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowLangPicker(false)}>
            <View style={s.langSheet}>
              <Text style={s.langSheetTitle}>Select Language</Text>
              {LANGS.map(l => (
                <TouchableOpacity
                  key={l.code}
                  style={[s.langRow, language === l.code && s.langRowActive]}
                  onPress={() => { setLanguage(l.code); setShowLangPicker(false); }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.langLabel, language === l.code && { color: Colors.primary.green }]}>{l.label}</Text>
                    <Text style={s.langNative}>{l.native}</Text>
                  </View>
                  {language === l.code && <Text style={{ color: Colors.primary.green, fontSize: 18 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {loading ? (
          <View style={{ padding: Spacing['3xl'], alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary.green} />
            <Text style={{ marginTop: Spacing.md, color: Colors.neutral.gray, fontFamily: Typography.fontFamily.regular }}>Loading your data...</Text>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={s.statsRow}>
              <View style={[s.stat, { backgroundColor: Colors.primary.green }]}>
                <Text style={s.statLabel}>Total Farmers</Text>
                <Text style={s.statVal}>{stats?.totalFarmers ?? 0}</Text>
                <Text style={s.statBg}>👨‍🌾</Text>
              </View>
              <View style={[s.stat, { backgroundColor: Colors.sky.blue }]}>
                <Text style={s.statLabel}>Today's Milk</Text>
                <Text style={s.statVal}>{stats?.todaysMilkLiters ?? 0} L</Text>
                <Text style={s.statBg}>🥛</Text>
              </View>
            </View>
            <View style={s.statsRow2}>
              <View style={[s.statSm, { backgroundColor: '#FFF8E1', borderColor: Colors.accent.wheat + '66' }]}>
                <Text style={s.statSmLabel}>Today's Amount</Text>
                <Text style={[s.statSmVal, { color: Colors.accent.amber }]}>{formatINR(stats?.todaysAmount ?? 0)}</Text>
              </View>
              <View style={[s.statSm, { backgroundColor: Colors.primary.lightGreen, borderColor: Colors.primary.green + '33' }]}>
                <Text style={s.statSmLabel}>Entries Today</Text>
                <Text style={[s.statSmVal, { color: Colors.primary.green }]}>{stats?.todaysEntries.length ?? 0}</Text>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity style={s.cta} onPress={() => router.push('/(collector)/milk-entry')} activeOpacity={0.85}>
              <Text style={s.ctaText}>+  Record Milk Collection</Text>
            </TouchableOpacity>

            {/* Today's entries */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Today's Collection</Text>
                <TouchableOpacity onPress={() => router.push('/(collector)/farmers')}>
                  <Text style={s.sectionLink}>View Farmers</Text>
                </TouchableOpacity>
              </View>

              {stats?.todaysEntries.length === 0 ? (
                <View style={s.emptyCard}>
                  <Text style={s.emptyIcon}>🥛</Text>
                  <Text style={s.emptyTitle}>No collections yet today</Text>
                  <Text style={s.emptySub}>Tap the button above to record milk collection</Text>
                </View>
              ) : (
                stats?.todaysEntries.slice(0, 5).map((r) => (
                  <View key={r.entry.id} style={s.entryCard}>
                    <View style={s.avatar}><Text style={s.avatarText}>{r.farmer.name[0]}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.entryName}>{r.farmer.name}</Text>
                      <Text style={s.entryTime}>{new Date(r.entry.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: Spacing.sm }}>
                      <Text style={s.entryL}>{r.entry.volume} L</Text>
                      <Text style={s.entryAmt}>{formatINR(r.entry.totalAmount)}</Text>
                    </View>
                    <View style={s.check}><Text style={{ color: Colors.semantic.success }}>✓</Text></View>
                  </View>
                ))
              )}
            </View>

            {/* Weekly trend */}
            {stats && stats.weeklyTrend.some(d => d.liters > 0) && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>This Week</Text>
                <View style={s.weekRow}>
                  {stats.weeklyTrend.map((d) => {
                    const max = Math.max(...stats.weeklyTrend.map(x => x.liters), 1);
                    const pct = d.liters / max;
                    const day = new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' });
                    return (
                      <View key={d.date} style={s.weekBar}>
                        <View style={[s.barFill, { height: Math.max(pct * 70, d.liters > 0 ? 4 : 0) }]} />
                        <Text style={s.barDay}>{day}</Text>
                        {d.liters > 0 && <Text style={s.barVal}>{d.liters}L</Text>}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.offWhite },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary.green, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing['2xl'] },
  greeting: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: '#fff' },
  id: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  langBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.md, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: Spacing.sm },
  langBtnText: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.xs, color: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  langSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, paddingBottom: Spacing['3xl'] },
  langSheetTitle: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.neutral.charcoal, marginBottom: Spacing.lg },
  langRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.xs },
  langRowActive: { backgroundColor: Colors.primary.lightGreen },
  langLabel: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.neutral.charcoal },
  langNative: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginHorizontal: Spacing.xl, marginTop: Spacing.lg, marginBottom: Spacing.md },
  statsRow2: { flexDirection: 'row', gap: Spacing.md, marginHorizontal: Spacing.xl, marginTop: 0, marginBottom: Spacing.md },
  stat: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.base, minHeight: 90, overflow: 'hidden', ...Shadows.card },
  statLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.8)' },
  statVal: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: '#fff', marginTop: 2 },
  statBg: { position: 'absolute', right: 8, bottom: 8, fontSize: 30, opacity: 0.25 },
  statSm: { flex: 1, borderRadius: BorderRadius.lg, padding: Spacing.base, borderWidth: 1, ...Shadows.card },
  statSmLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray },
  statSmVal: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, marginTop: 2 },
  cta: { backgroundColor: Colors.primary.green, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center', ...Shadows.elevated },
  ctaText: { color: '#fff', fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md },
  section: { marginTop: Spacing.xl, marginHorizontal: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.neutral.charcoal },
  sectionLink: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.primary.green },
  emptyCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing['2xl'], alignItems: 'center', ...Shadows.card },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.neutral.charcoal },
  emptySub: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray, textAlign: 'center', marginTop: Spacing.xs },
  entryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary.lightGreen, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  avatarText: { fontFamily: Typography.fontFamily.semibold, color: Colors.primary.green },
  entryName: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.neutral.charcoal },
  entryTime: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray },
  entryL: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.base, color: Colors.sky.blue },
  entryAmt: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray },
  check: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.semantic.success + '20', alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.base, ...Shadows.card, height: 130, overflow: 'hidden' },
  weekBar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barFill: { width: 20, backgroundColor: Colors.primary.green, borderRadius: 4, marginBottom: 4 },
  barDay: { fontFamily: Typography.fontFamily.regular, fontSize: 9, color: Colors.neutral.gray },
  barVal: { fontFamily: Typography.fontFamily.regular, fontSize: 8, color: Colors.primary.green },
});

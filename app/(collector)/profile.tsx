import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/language'); } },
    ]);
  }

  const INFO = [
    { icon: '📱', label: 'Mobile Number', value: user?.phone ?? '—' },
    { icon: '🪪', label: 'Collector ID',  value: user?.collectorId ?? 'COL001' },
    { icon: '🌐', label: 'Language',      value: (user?.language ?? 'en').toUpperCase() },
    { icon: '🤖', label: 'MilkX AI',     value: 'Configure API Key →' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>{user?.name?.[0] ?? 'C'}</Text></View>
        <Text style={s.name}>{user?.name ?? 'Collector'}</Text>
        <Text style={s.id}>{user?.collectorId ?? 'COL001'}</Text>
      </View>
      <ScrollView contentContainerStyle={[s.body, { paddingBottom: 100 }]}>
        {INFO.map(item => (
          <TouchableOpacity key={item.label} style={s.row} activeOpacity={0.7}>
            <View style={s.rowIcon}><Text style={{ fontSize: 18 }}>{item.icon}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowLabel}>{item.label}</Text>
              <Text style={s.rowValue}>{item.value}</Text>
            </View>
            <Text style={{ color: Colors.neutral.midGray, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.logout} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={s.version}>MilkX v1.0.0 · Expo SDK 54</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.offWhite },
  header: { backgroundColor: Colors.primary.green, alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing['2xl'] },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, ...Shadows.elevated },
  avatarText: { fontFamily: Typography.fontFamily.heading, fontSize: 30, color: Colors.primary.green },
  name: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' },
  id: { fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  body: { padding: Spacing.xl, gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.base, ...Shadows.card },
  rowIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.neutral.offWhite, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rowLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray },
  rowValue: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.neutral.charcoal, marginTop: 1 },
  logout: { backgroundColor: Colors.semantic.error + '15', borderRadius: BorderRadius.full, padding: Spacing.base, alignItems: 'center', marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.semantic.error + '30' },
  logoutText: { fontFamily: Typography.fontFamily.semibold, color: Colors.semantic.error },
  version: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, textAlign: 'center', marginTop: Spacing.md },
});

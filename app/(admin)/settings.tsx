import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function AdminSettingsScreen() {
  const { logout } = useAuthStore();

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral.offWhite }}>
      <View style={{ backgroundColor: Colors.primary.green, padding: Spacing.xl, paddingBottom: Spacing['2xl'] }}>
        <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' }}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, alignItems: 'center', paddingTop: Spacing['4xl'] }}>
        <Text style={{ fontSize: 48 }}>🚧</Text>
        <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal, marginTop: Spacing.md }}>Coming Soon</Text>
        <Text style={{ fontFamily: Typography.fontFamily.regular, color: Colors.neutral.gray, textAlign: 'center', marginTop: Spacing.sm }}>This section is under development</Text>
        <TouchableOpacity style={s.logout} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  logout: { marginTop: 40, backgroundColor: Colors.semantic.error + '15', borderRadius: BorderRadius.full, paddingVertical: Spacing.base, paddingHorizontal: Spacing['2xl'], alignItems: 'center', borderWidth: 1, borderColor: Colors.semantic.error + '30' },
  logoutText: { fontFamily: Typography.fontFamily.semibold, color: Colors.semantic.error },
});

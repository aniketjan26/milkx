import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
export default function FarmerProfile() {
  const { user, logout } = useAuthStore();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.neutral.offWhite }}>
      <View style={{ backgroundColor: Colors.primary.green, alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing['2xl'] }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }}>
          <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: 28, color: Colors.primary.green }}>{user?.name?.[0] ?? 'F'}</Text>
        </View>
        <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' }}>{user?.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: Typography.fontFamily.regular, marginTop: 2 }}>{user?.farmerId ?? 'Farmer'}</Text>
      </View>
      <View style={{ padding: Spacing.xl }}>
        <TouchableOpacity
          style={{ backgroundColor: Colors.semantic.error + '15', borderRadius: BorderRadius.full, padding: Spacing.base, alignItems: 'center', marginTop: Spacing.md }}
          onPress={() => Alert.alert('Logout', 'Sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } }])}
        >
          <Text style={{ fontFamily: Typography.fontFamily.semibold, color: Colors.semantic.error }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

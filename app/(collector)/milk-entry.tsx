import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { calculatePayment, validateMilkQuality, formatINR } from '../../src/utils/calculations';
// import { getFarmersByCollector, addMilkEntry, addPayment } from '../../src/db/service';
// import { useAuthStore } from '../../src/store/authStore';
import type { Shift } from '../../src/types';
import { getFarmersByCollector, addMilkEntry, addPayment } from '@/services/service';
import { useAuthStore } from '@/store/authStore';

interface Farmer { id: string; farmerId: string; name: string; }

export default function MilkEntry() {
  const { user } = useAuthStore();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [shift, setShift] = useState<Shift>('morning');
  const [volume, setVolume] = useState('');
  const [fat, setFat] = useState('4.0');
  const [snf, setSnf] = useState('8.5');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  const collectorId = user?.collectorId ?? '';
  const today = new Date().toISOString().split('T')[0];

  useFocusEffect(useCallback(() => {
    async function load() {
      if (!collectorId) return;
      const data = await getFarmersByCollector(collectorId);
      const list = data as Farmer[];
      setFarmers(list);
      if (list.length > 0) setFarmer(list[0]);
      setLoadingFarmers(false);
    }
    load();
  }, [collectorId]));

  // Detect morning/evening automatically
  useEffect(() => {
    const h = new Date().getHours();
    setShift(h < 13 ? 'morning' : 'evening');
  }, []);

  const effectiveFat = fat || '4.0';
  const effectiveSnf = snf || '8.5';
  const calc = volume
    ? calculatePayment({ volume: +volume, fat: +effectiveFat, snf: +effectiveSnf, baseRate: 35, method: 'per_liter' })
    : null;

  async function handleSave() {
    if (!farmer) { Alert.alert('Select Farmer', 'Please select a farmer first'); return; }
    if (!volume) { Alert.alert('Missing Fields', 'Please enter the volume'); return; }
    const { valid, warnings } = validateMilkQuality(+effectiveFat, +effectiveSnf);
    if (!valid) {
      Alert.alert('Quality Warning', warnings.join('\n'), [
        { text: 'Review', style: 'cancel' },
        { text: 'Save Anyway', onPress: save },
      ]);
    } else { save(); }
  }

  async function save() {
    if (!farmer || !calc) return;
    setSaving(true);
    try {
      await addMilkEntry({
        farmerId: farmer.farmerId,
        collectorId,
        date: today,
        shift,
        volume: +volume,
        fat: +effectiveFat,
        snf: +effectiveSnf,
        ratePerLiter: calc.ratePerLiter,
        totalAmount: calc.totalAmount,
        rateMethod: 'per_liter',
      });
      // Auto-create payment record
      await addPayment({
        farmerId: farmer.farmerId,
        collectorId,
        amount: calc.totalAmount,
        type: 'milk_payment',
        period: today,
      });
      setSaved(true);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to save record');
    } finally {
      setSaving(false);
    }
  }

  if (saved) return (
    <SafeAreaView style={[s.container, { backgroundColor: Colors.primary.green, justifyContent: 'center', alignItems: 'center' }]}>
      <View style={s.successCard}>
        <View style={s.successIcon}><Text style={{ color: '#fff', fontSize: 38, fontWeight: 'bold' }}>✓</Text></View>
        <Text style={s.successTitle}>Record Saved{'\n'}Successfully!</Text>
        <Text style={s.successSub}>{(+volume).toFixed(1)} L recorded for {farmer?.name}</Text>
        <View style={s.successAmt}>
          <Text style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray }}>Amount Calculated</Text>
          <Text style={{ fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: Colors.primary.green }}>{calc ? formatINR(calc.totalAmount) : '—'}</Text>
        </View>
        <TouchableOpacity onPress={() => { setSaved(false); setVolume(''); setFat('4.0'); setSnf('8.5'); }} style={{ marginBottom: Spacing.md }}>
          <Text style={{ color: Colors.primary.green, fontFamily: Typography.fontFamily.medium }}>+ Add Another Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
          <Text style={{ color: '#fff', fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md }}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>‹</Text></TouchableOpacity>
        <Text style={s.title}>Milk Entry</Text>
        <Text style={s.farmerId}>{farmer?.farmerId ?? '—'}</Text>
      </View>

      {loadingFarmers ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary.green} />
        </View>
      ) : farmers.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
          <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🌾</Text>
          <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal, textAlign: 'center' }}>No farmers yet</Text>
          <Text style={{ fontFamily: Typography.fontFamily.regular, color: Colors.neutral.gray, textAlign: 'center', marginTop: Spacing.sm }}>Add farmers first before recording milk</Text>
          <TouchableOpacity style={[s.doneBtn, { marginTop: Spacing.xl }]} onPress={() => router.push('/(collector)/farmers')}>
            <Text style={{ color: '#fff', fontFamily: Typography.fontFamily.semibold }}>+ Add Farmer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ padding: Spacing.xl }} showsVerticalScrollIndicator={false}>
          {/* Date & Shift */}
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Date</Text>
              <View style={s.readOnly}><Text style={s.readOnlyText}>{new Date().toLocaleDateString('en-IN')}</Text></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Shift</Text>
              <View style={s.shiftToggle}>
                {(['morning', 'evening'] as Shift[]).map(sh => (
                  <TouchableOpacity key={sh} style={[s.shiftBtn, shift === sh && s.shiftBtnActive]} onPress={() => setShift(sh)}>
                    <Text style={[s.shiftText, shift === sh && { color: Colors.primary.green }]}>{sh === 'morning' ? '☀️ Morning' : '🌙 Evening'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Farmer selector */}
          <Text style={s.label}>Select Farmer</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            {farmers.map(f => (
              <TouchableOpacity key={f.id} style={[s.chip, farmer?.id === f.id && s.chipActive]} onPress={() => setFarmer(f)}>
                <Text style={[s.chipText, farmer?.id === f.id && s.chipTextActive]}>{f.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Readings */}
          <View style={s.row}>
            {[
              { l: 'Volume (L) *', v: volume, sv: setVolume, p: '0.0' },
              { l: 'Fat (%)', v: fat, sv: setFat, p: '4.0' },
              { l: 'SNF (%)', v: snf, sv: setSnf, p: '8.5' },
            ].map(({ l, v, sv, p }) => (
              <View key={l} style={{ flex: 1 }}>
                <Text style={s.label}>{l}</Text>
                <TextInput style={s.input} value={v} onChangeText={sv} keyboardType="decimal-pad" placeholder={p} placeholderTextColor={Colors.neutral.midGray} />
              </View>
            ))}
          </View>

          {/* Calculation */}
          <View style={s.calcCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
              <Text style={s.calcLabel}>Rate (per Liter)</Text>
              <Text style={s.calcVal}>₹35.00</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.neutral.lightGray, paddingTop: Spacing.sm }}>
              <Text style={s.calcTotalLabel}>Total Amount</Text>
              <Text style={s.calcTotalVal}>{calc ? formatINR(calc.totalAmount) : '₹ —'}</Text>
            </View>
            {calc && <Text style={{ fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, marginTop: 2 }}>{calc.breakdown}</Text>}
          </View>

          {/* Actions */}
          <View style={s.row}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()}>
              <Text style={{ fontFamily: Typography.fontFamily.medium, color: Colors.neutral.darkGray }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md }}>Save & Done</Text>}
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.offWhite },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.primary.green, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base },
  back: { color: '#fff', fontSize: 26, fontWeight: '300' },
  title: { flex: 1, fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: '#fff' },
  farmerId: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.7)' },
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.neutral.darkGray, marginBottom: Spacing.xs },
  readOnly: { backgroundColor: Colors.neutral.lightGray, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderWidth: 1, borderColor: Colors.neutral.midGray },
  readOnlyText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.neutral.darkGray },
  shiftToggle: { flexDirection: 'row', gap: 3, backgroundColor: Colors.neutral.lightGray, borderRadius: BorderRadius.md, padding: 3 },
  shiftBtn: { flex: 1, paddingVertical: 7, borderRadius: BorderRadius.sm, alignItems: 'center' },
  shiftBtnActive: { backgroundColor: '#fff', ...Shadows.card },
  shiftText: { fontFamily: Typography.fontFamily.medium, fontSize: 11, color: Colors.neutral.gray },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.neutral.midGray, marginRight: Spacing.sm, backgroundColor: '#fff' },
  chipActive: { borderColor: Colors.primary.green, backgroundColor: Colors.primary.lightGreen },
  chipText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.neutral.gray },
  chipTextActive: { color: Colors.primary.green },
  input: { backgroundColor: '#fff', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.md, color: Colors.neutral.charcoal, borderWidth: 1, borderColor: Colors.neutral.lightGray, textAlign: 'center' },
  calcCard: { backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.base, borderWidth: 1, borderColor: Colors.primary.lightGreen, ...Shadows.card },
  calcLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.base, color: Colors.neutral.darkGray },
  calcVal: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.neutral.charcoal },
  calcTotalLabel: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.neutral.charcoal },
  calcTotalVal: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: Colors.primary.green },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.neutral.midGray, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center' },
  saveBtn: { flex: 2, backgroundColor: Colors.primary.green, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center', ...Shadows.elevated },
  successCard: { backgroundColor: '#fff', borderRadius: 24, margin: Spacing.xl, padding: Spacing['2xl'], alignItems: 'center', width: '90%' },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary.green, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.base },
  successTitle: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: Colors.neutral.charcoal, textAlign: 'center', marginBottom: Spacing.sm },
  successSub: { fontFamily: Typography.fontFamily.regular, color: Colors.neutral.gray, textAlign: 'center', marginBottom: Spacing.xl },
  successAmt: { backgroundColor: Colors.primary.lightGreen, borderRadius: BorderRadius.lg, padding: Spacing.base, width: '100%', alignItems: 'center', marginBottom: Spacing.xl },
  doneBtn: { backgroundColor: Colors.primary.green, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, paddingHorizontal: Spacing['2xl'] },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';

type Role = 'collector' | 'farmer' | 'admin';

// ─── Inline numeric keypad ───────────────────────────────────
function Keypad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  function press(k: string) {
    if (k === '⌫') { onChange(value.slice(0, -1)); return; }
    if (k === '') return;
    if (value.length < 4) onChange(value + k);
  }

  return (
    <View style={kp.grid}>
      {keys.map((k, i) => (
        <TouchableOpacity
          key={i}
          style={[kp.key, k === '' && kp.keyEmpty, k === '⌫' && kp.keyDel]}
          onPress={() => press(k)}
          activeOpacity={k === '' ? 1 : 0.6}
          disabled={k === ''}
        >
          <Text style={[kp.keyText, k === '⌫' && kp.keyDelText]}>{k}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const kp = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: Spacing.xl, marginTop: Spacing.lg },
  key: {
    width: '33.33%', height: 64,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: Colors.neutral.lightGray,
    backgroundColor: Colors.neutral.white,
  },
  keyEmpty: { backgroundColor: Colors.neutral.offWhite },
  keyDel: { backgroundColor: Colors.neutral.offWhite },
  keyText: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size['2xl'], color: Colors.neutral.charcoal },
  keyDelText: { fontSize: Typography.size.xl, color: Colors.neutral.darkGray },
});

// ─── Passcode dots ───────────────────────────────────────────
function PasscodeDots({ value, error }: { value: string; error?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.lg, justifyContent: 'center', marginVertical: Spacing.xl }}>
      {[0,1,2,3].map(i => (
        <View key={i} style={[
          pd.dot,
          value.length > i && pd.dotFilled,
          error && pd.dotError,
        ]} />
      ))}
    </View>
  );
}

const pd = StyleSheet.create({
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: Colors.neutral.midGray, backgroundColor: 'transparent' },
  dotFilled: { backgroundColor: Colors.primary.green, borderColor: Colors.primary.green },
  dotError: { borderColor: Colors.semantic.error },
});

// ─── Main component ──────────────────────────────────────────
export default function RegisterScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { register } = useAuthStore();

  const [step, setStep] = useState<'details' | 'passcode' | 'confirm'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length === 4 && confirm.length > 0 && passcode !== confirm;
  const roleLabel = role === 'farmer' ? 'Farmer' : role === 'admin' ? 'Admin' : 'Collector';
  const roleEmoji = role === 'farmer' ? '🌾' : role === 'admin' ? '🏪' : '👨‍💼';

  function validateDetails() {
    if (!name.trim()) { Alert.alert('Required', 'Please enter your full name'); return false; }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) { Alert.alert('Invalid', 'Enter a valid 10-digit mobile number'); return false; }
    return true;
  }

  // Auto-advance when passcode is complete
  function handlePasscodeChange(v: string) {
    setPasscode(v);
    if (v.length === 4) {
      // small delay so user sees 4th dot fill before moving
      setTimeout(() => setStep('confirm'), 150);
    }
  }

  function handleConfirmChange(v: string) {
    setConfirm(v);
    if (v.length === 4) {
      // Pass v directly — don't rely on confirm state which hasn't updated yet
      setTimeout(() => handleRegister(v), 150);
    }
  }

  async function handleRegister(confirmedValue: string) {
    // Compare passcode with the freshly entered value, not stale state
    if (passcode !== confirmedValue) {
      setConfirm('');
      Alert.alert('Passcodes Don\'t Match', 'Please try again.', [
        { text: 'Retry', onPress: () => { setConfirm(''); } }
      ]);
      return;
    }
    setLoading(true);
    const actualRole = (role as Role) ?? 'collector';
    const result = await register({ name, phone, role: actualRole, passcode });
    setLoading(false);
    if (!result.success) {
      Alert.alert('Registration Failed', result.error ?? 'Something went wrong');
      setStep('details');
      return;
    }
    // Navigate based on actual role stored in user object
    if (actualRole === 'farmer') {
      router.replace('/(farmer)/dashboard' as any);
    } else if (actualRole === 'admin') {
      router.replace('/(admin)/dashboard' as any);
    } else {
      router.replace('/(collector)/dashboard' as any);
    }
  }

  // ── Step: Details ──
  if (step === 'details') {
    return (
      <SafeAreaView style={s.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={s.header}>
              <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>‹ Back</Text></TouchableOpacity>
              <Text style={s.title}>Create Account</Text>
              <View style={s.roleBadge}>
                <Text style={{ fontSize: 15 }}>{roleEmoji}</Text>
                <Text style={s.roleText}>  {roleLabel}</Text>
              </View>
            </View>

            <View style={s.stepRow}>
              <View style={s.stepDot}><Text style={s.stepDotText}>1</Text></View>
              <Text style={s.stepLabel}>Your Details</Text>
              <View style={[s.stepDot, s.stepDotInactive]}><Text style={s.stepDotTextInactive}>2</Text></View>
              <Text style={s.stepLabelInactive}>Set Passcode</Text>
            </View>

            <View style={s.form}>
              <Text style={s.sectionTitle}>Personal Information</Text>

              <View style={s.field}>
                <Text style={s.label}>Full Name *</Text>
                <TextInput
                  style={s.input} value={name} onChangeText={setName}
                  placeholder="e.g. Ramesh Kumar"
                  placeholderTextColor={Colors.neutral.midGray}
                  autoCapitalize="words" autoFocus returnKeyType="next"
                />
              </View>

              <View style={s.field}>
                <Text style={s.label}>Mobile Number *</Text>
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <View style={s.countryCode}><Text style={s.countryText}>🇮🇳 +91</Text></View>
                  <TextInput
                    style={[s.input, { flex: 1 }]} value={phone} onChangeText={setPhone}
                    placeholder="10-digit number"
                    placeholderTextColor={Colors.neutral.midGray}
                    keyboardType="phone-pad" maxLength={10} returnKeyType="done"
                  />
                </View>
                <Text style={s.hint}>This will be your login ID</Text>
              </View>

              <TouchableOpacity
                style={s.btn}
                onPress={() => { if (validateDetails()) setStep('passcode'); }}
              >
                <Text style={s.btnText}>Continue →</Text>
              </TouchableOpacity>

              <View style={s.loginRow}>
                <Text style={s.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/login' as any, params: { role } })}>
                  <Text style={s.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── Step: Set Passcode ──
  if (step === 'passcode') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setStep('details')}><Text style={s.back}>‹ Back</Text></TouchableOpacity>
          <Text style={s.title}>Set Passcode</Text>
          <Text style={s.subtitle}>Choose a 4-digit passcode</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={s.passcodeInfo}>
            <Text style={s.passcodeHint}>🔐 Create your 4-digit passcode</Text>
            <Text style={s.passcodeFor}>For: {name} · {phone}</Text>
          </View>

          <PasscodeDots value={passcode} />

          <Keypad value={passcode} onChange={handlePasscodeChange} />

          <Text style={s.secNote}>Your passcode is encrypted and stored securely on this device</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step: Confirm Passcode ──
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => { setPasscode(''); setConfirm(''); setStep('passcode'); }}>
          <Text style={s.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Confirm Passcode</Text>
        <Text style={s.subtitle}>Enter the same passcode again</Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={s.passcodeInfo}>
          <Text style={s.passcodeHint}>✅ Re-enter your 4-digit passcode</Text>
          {mismatch && <Text style={s.mismatch}>Passcodes don't match — try again</Text>}
        </View>

        <PasscodeDots value={confirm} error={mismatch} />

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: Spacing['2xl'] }}>
            <ActivityIndicator size="large" color={Colors.primary.green} />
            <Text style={{ marginTop: Spacing.md, color: Colors.neutral.gray, fontFamily: Typography.fontFamily.regular }}>Creating your account...</Text>
          </View>
        ) : (
          <Keypad value={confirm} onChange={handleConfirmChange} />
        )}

        {confirm.length === 4 && passcode !== confirm && (
          <TouchableOpacity
            style={[s.btn, { marginHorizontal: Spacing.xl }]}
            onPress={() => { setPasscode(''); setConfirm(''); setStep('passcode'); }}
          >
            <Text style={s.btnText}>Start Over</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.white },
  header: {
    backgroundColor: Colors.primary.green,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  back: { color: 'rgba(255,255,255,0.85)', fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.md, marginBottom: Spacing.md },
  title: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: '#fff' },
  subtitle: { fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontSize: Typography.size.base },
  roleBadge: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, alignSelf: 'flex-start' },
  roleText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: '#fff' },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.sm },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary.green, alignItems: 'center', justifyContent: 'center' },
  stepDotText: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.sm, color: '#fff' },
  stepDotInactive: { backgroundColor: Colors.neutral.lightGray },
  stepDotTextInactive: { color: Colors.neutral.gray },
  stepLabel: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.primary.green, flex: 1 },
  stepLabelInactive: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray, flex: 1 },
  form: { paddingHorizontal: Spacing.xl },
  sectionTitle: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal, marginBottom: Spacing.lg },
  field: { marginBottom: Spacing.lg },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.neutral.darkGray, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.neutral.offWhite, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.md, color: Colors.neutral.charcoal, borderWidth: 1.5, borderColor: Colors.neutral.lightGray },
  countryCode: { backgroundColor: Colors.neutral.offWhite, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.neutral.lightGray },
  countryText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.md, color: Colors.neutral.charcoal },
  hint: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, marginTop: Spacing.xs },
  btn: { backgroundColor: Colors.primary.green, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center', ...Shadows.elevated, marginTop: Spacing.sm },
  btnText: { color: '#fff', fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing['2xl'] },
  loginText: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray },
  loginLink: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.sm, color: Colors.primary.green },
  passcodeInfo: { alignItems: 'center', paddingTop: Spacing.xl, paddingHorizontal: Spacing.xl },
  passcodeHint: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.neutral.charcoal, textAlign: 'center' },
  passcodeFor: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: Colors.neutral.gray, marginTop: Spacing.xs },
  mismatch: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.semantic.error, marginTop: Spacing.sm },
  secNote: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray, textAlign: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.lg },
});

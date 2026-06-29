import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { useAuthStore } from '@/store/authStore';
// import { useAuthStore } from '../../src/store/authStore';

type LoginMode = 'passcode' | 'biometric';

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const { loginWithPasscode, loginWithBiometric } = useAuthStore();

  const [mode, setMode] = useState<LoginMode>('passcode');
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const passcodeRef = useRef<any>(null);

  async function handlePasscodeLogin() {
    if (phone.length !== 10) { Alert.alert('Invalid', 'Enter your 10-digit registered mobile number'); return; }
    if (passcode.length !== 4) return;
    setLoading(true);
    const result = await loginWithPasscode(phone, passcode);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.error ?? 'Invalid credentials');
      setPasscode('');
      return;
    }
    router.replace(
      role === 'farmer' ? '/(farmer)/dashboard'
      : role === 'admin' ? '/(admin)/dashboard'
      : '/(collector)/dashboard'
    );
  }

  async function handleBiometric() {
    setLoading(true);
    const result = await loginWithBiometric();
    setLoading(false);
    if (!result.success) { Alert.alert('Biometric Failed', result.error ?? 'Try passcode instead'); return; }
    router.replace(
      role === 'farmer' ? '/(farmer)/dashboard'
      : role === 'admin' ? '/(admin)/dashboard'
      : '/(collector)/dashboard'
    );
  }

  const roleLabel = role === 'farmer' ? 'Farmer' : role === 'admin' ? 'Admin' : 'Collector';

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>‹ Back</Text></TouchableOpacity>
          <Text style={s.title}>{roleLabel} Login</Text>
          <Text style={s.subtitle}>Welcome back! Enter your credentials</Text>
        </View>

        {/* Mode tabs */}
        <View style={s.tabs}>
          {(['passcode', 'biometric'] as LoginMode[]).map(m => (
            <TouchableOpacity key={m} style={[s.tab, mode === m && s.tabActive]} onPress={() => setMode(m)}>
              <Text style={[s.tabText, mode === m && s.tabTextActive]}>
                {m === 'passcode' ? '🔢 Passcode' : '🔒 Biometric'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.form}>
          {mode === 'passcode' ? (
            <>
              {/* Phone */}
              <Text style={s.label}>Mobile Number</Text>
              <View style={s.phoneRow}>
                <View style={s.countryCode}><Text style={s.countryText}>🇮🇳 +91</Text></View>
                <TextInput
                  style={[s.input, { flex: 1 }]} value={phone} onChangeText={setPhone}
                  placeholder="Registered mobile number" placeholderTextColor={Colors.neutral.midGray}
                  keyboardType="phone-pad" maxLength={10} autoFocus
                />
              </View>

              {/* Passcode */}
              <Text style={[s.label, { marginTop: Spacing.xl }]}>4-Digit Passcode</Text>
              <TouchableOpacity activeOpacity={1} onPress={() => passcodeRef.current?.focus()} style={s.dots}>
                {[0,1,2,3].map(i => <View key={i} style={[s.dot, passcode.length > i && s.dotFilled]} />)}
              </TouchableOpacity>
              <TextInput
                ref={passcodeRef}
                value={passcode} onChangeText={v => { if (/^\d*$/.test(v) && v.length <= 4) setPasscode(v); }}
                keyboardType="numeric" maxLength={4} secureTextEntry style={s.hidden}
                onSubmitEditing={handlePasscodeLogin}
              />

              <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: Spacing.xl }}>
                <Text style={s.forgot}>Forgot Passcode?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.btn, (loading || phone.length !== 10 || passcode.length !== 4) && { opacity: 0.5 }]}
                onPress={handlePasscodeLogin}
                disabled={loading || phone.length !== 10 || passcode.length !== 4}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Login</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingTop: Spacing['2xl'] }}>
              <Text style={{ fontSize: 72, marginBottom: Spacing.xl }}>🔒</Text>
              <Text style={{ fontFamily: Typography.fontFamily.regular, color: Colors.neutral.gray, textAlign: 'center', marginBottom: Spacing['2xl'], lineHeight: 22 }}>
                Use your fingerprint or Face ID to login.{'\n'}You must have logged in with passcode at least once.
              </Text>
              <TouchableOpacity style={[s.btn, { width: '100%' }, loading && { opacity: 0.7 }]} onPress={handleBiometric} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>🔒  Login with Biometric</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Register link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.xl }}>
            <Text style={{ color: Colors.neutral.gray, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm }}>New user? </Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/register' as any, params: { role } })}>
              <Text style={{ color: Colors.primary.green, fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.sm }}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.white },
  header: { backgroundColor: Colors.primary.green, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing['2xl'], borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  back: { color: 'rgba(255,255,255,0.8)', fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.md, marginBottom: Spacing.md },
  title: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: '#fff' },
  subtitle: { fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  tabs: { flexDirection: 'row', margin: Spacing.xl, gap: Spacing.sm },
  tab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.neutral.midGray, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primary.green, borderColor: Colors.primary.green },
  tabText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.neutral.gray },
  tabTextActive: { color: '#fff' },
  form: { paddingHorizontal: Spacing.xl },
  label: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm, color: Colors.neutral.darkGray, marginBottom: Spacing.xs },
  phoneRow: { flexDirection: 'row', gap: Spacing.sm },
  countryCode: { backgroundColor: Colors.neutral.offWhite, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, justifyContent: 'center', borderWidth: 1, borderColor: Colors.neutral.lightGray },
  countryText: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.md, color: Colors.neutral.charcoal },
  input: { backgroundColor: Colors.neutral.offWhite, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.md, color: Colors.neutral.charcoal, borderWidth: 1, borderColor: Colors.neutral.lightGray },
  dots: { flexDirection: 'row', gap: Spacing.xl, justifyContent: 'center', marginVertical: Spacing.lg },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.neutral.midGray },
  dotFilled: { backgroundColor: Colors.primary.green, borderColor: Colors.primary.green },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  forgot: { color: Colors.primary.green, fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.sm },
  btn: { backgroundColor: Colors.primary.green, borderRadius: BorderRadius.full, paddingVertical: Spacing.base, alignItems: 'center', ...Shadows.elevated },
  btnText: { color: '#fff', fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md },
});

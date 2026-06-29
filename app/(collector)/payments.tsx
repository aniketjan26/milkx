import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { formatINR } from '../../src/utils/calculations';
import { getPaymentsByCollector } from '@/services/service';
import { useAuthStore } from '@/store/authStore';
// import { getPaymentsByCollector } from '../../src/db/service';
// import { useAuthStore } from '../../src/store/authStore';

interface PaymentRow {
  payment: { id: string; amount: number; type: string; status: string | null; createdAt: string };
  farmer: { name: string; farmerId: string };
}

export default function PaymentsScreen() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const collectorId = user?.collectorId ?? '';

  useFocusEffect(useCallback(() => {
    async function load() {
      if (!collectorId) return;
      const data = await getPaymentsByCollector(collectorId);
      setPayments(data as any);
      setLoading(false);
    }
    load();
  }, [collectorId]));

  const total = payments.filter(p => p.payment.type === 'milk_payment').reduce((s, p) => s + p.payment.amount, 0);

  const TYPE_LABELS: Record<string, string> = {
    milk_payment: 'Milk Collection Payment',
    cash_request: 'Cash Request',
    withdrawal: 'Withdrawal',
  };

  const TYPE_CREDIT: Record<string, boolean> = {
    milk_payment: true,
    cash_request: false,
    withdrawal: false,
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}><Text style={s.title}>Payment History</Text></View>

      <View style={s.summary}>
        <Text style={s.summaryLabel}>Total Payments Recorded</Text>
        <Text style={s.summaryAmt}>{formatINR(total)}</Text>
        <Text style={s.summaryCount}>{payments.length} transactions</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary.green} />
        </View>
      ) : (
        <FlatList
          data={payments} keyExtractor={p => p.payment.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: Spacing['4xl'] }}>
              <Text style={{ fontSize: 48 }}>💰</Text>
              <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.lg, color: Colors.neutral.charcoal, marginTop: Spacing.md }}>No payments yet</Text>
              <Text style={{ fontFamily: Typography.fontFamily.regular, color: Colors.neutral.gray, marginTop: Spacing.xs }}>Payments appear after milk entries are saved</Text>
            </View>
          }
          renderItem={({ item: p }) => {
            const credit = TYPE_CREDIT[p.payment.type] ?? true;
            return (
              <View style={s.row}>
                <View style={[s.icon, { backgroundColor: credit ? Colors.primary.lightGreen : '#FFEEEE' }]}>
                  <Text style={{ fontSize: 18 }}>{credit ? '📈' : '📤'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                  <Text style={s.payType}>{TYPE_LABELS[p.payment.type] ?? p.payment.type}</Text>
                  <Text style={s.payMeta}>{p.farmer.name} · {p.farmer.farmerId}</Text>
                  <Text style={s.payDate}>{new Date(p.payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <Text style={[s.amt, { color: credit ? Colors.primary.green : Colors.semantic.error }]}>
                  {credit ? '+' : '-'} {formatINR(p.payment.amount)}
                </Text>
              </View>
            );
          }}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.offWhite },
  header: { backgroundColor: Colors.primary.green, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base, paddingBottom: Spacing.xl },
  title: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: '#fff' },
  summary: { marginHorizontal: Spacing.xl, marginTop: -Spacing.lg, backgroundColor: Colors.neutral.charcoal, borderRadius: BorderRadius.lg, padding: Spacing.base, marginBottom: Spacing.md, ...Shadows.elevated },
  summaryLabel: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.6)' },
  summaryAmt: { fontFamily: Typography.fontFamily.heading, fontSize: Typography.size['2xl'], color: Colors.accent.wheat, marginTop: 2 },
  summaryCount: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  payType: { fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.base, color: Colors.neutral.charcoal },
  payMeta: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.gray },
  payDate: { fontFamily: Typography.fontFamily.regular, fontSize: Typography.size.xs, color: Colors.neutral.midGray, marginTop: 1 },
  amt: { fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md },
});

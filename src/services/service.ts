// ============================================================
// MilkX — Database Service
// All real DB queries using Drizzle ORM
// ============================================================
// import { db } from './client';
// import { farmers, milkEntries, payments, users } from './schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { generateId } from '../utils/calculations';
import { db } from '@/db/client';
import { farmers, milkEntries, payments } from '@/db/schema';

// ─── FARMERS ────────────────────────────────────────────────

export async function getFarmersByCollector(collectorId: string) {
  return db
    .select()
    .from(farmers)
    .where(and(eq(farmers.collectorId, collectorId), eq(farmers.active, true)))
    .orderBy(farmers.name);
}

export async function getFarmerById(farmerId: string) {
  const rows = await db.select().from(farmers).where(eq(farmers.farmerId, farmerId));
  return rows[0] ?? null;
}

export async function addFarmer(data: {
  name: string; phone: string; collectorId: string;
  address?: string; bankAccount?: string; ifsc?: string;
  aadhar?: string; upiId?: string;
}) {
  const now = new Date().toISOString();
  // Generate next farmer ID
  const existing = await db.select().from(farmers).where(eq(farmers.collectorId, data.collectorId));
  const farmerNum = existing.length + 1;
  const farmerId = `FAR${String(farmerNum).padStart(3, '0')}`;

  await db.insert(farmers).values({
    id: generateId('f_'),
    farmerId,
    name: data.name.trim(),
    phone: data.phone.trim(),
    collectorId: data.collectorId,
    address: data.address,
    bankAccount: data.bankAccount,
    ifsc: data.ifsc,
    aadhar: data.aadhar,
    upiId: data.upiId,
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  return farmerId;
}

export async function updateFarmer(id: string, data: Partial<{
  name: string; phone: string; address: string;
  bankAccount: string; ifsc: string; aadhar: string; upiId: string;
}>) {
  await db.update(farmers).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(farmers.id, id));
}

export async function deactivateFarmer(id: string) {
  await db.update(farmers).set({ active: false, updatedAt: new Date().toISOString() }).where(eq(farmers.id, id));
}

// ─── MILK ENTRIES ────────────────────────────────────────────

export async function addMilkEntry(data: {
  farmerId: string; collectorId: string; date: string;
  shift: 'morning' | 'evening'; volume: number; fat: number;
  snf: number; ratePerLiter: number; totalAmount: number;
  rateMethod: string;
}) {
  const id = generateId('m_');
  await db.insert(milkEntries).values({
    id,
    farmerId: data.farmerId,
    collectorId: data.collectorId,
    date: data.date,
    shift: data.shift,
    volume: data.volume,
    fat: data.fat,
    snf: data.snf,
    ratePerLiter: data.ratePerLiter,
    totalAmount: data.totalAmount,
    rateMethod: data.rateMethod,
    synced: false,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function getMilkEntriesForDate(collectorId: string, date: string) {
  return db
    .select({ entry: milkEntries, farmer: farmers })
    .from(milkEntries)
    .innerJoin(farmers, eq(milkEntries.farmerId, farmers.farmerId))
    .where(and(eq(milkEntries.collectorId, collectorId), eq(milkEntries.date, date)))
    .orderBy(desc(milkEntries.createdAt));
}

export async function getMilkEntriesForFarmer(farmerId: string, limit = 30) {
  return db
    .select()
    .from(milkEntries)
    .where(eq(milkEntries.farmerId, farmerId))
    .orderBy(desc(milkEntries.date), desc(milkEntries.createdAt))
    .limit(limit);
}

export async function getDashboardStats(collectorId: string) {
  const today = new Date().toISOString().split('T')[0];

  // Total farmers
  const farmerRows = await db
    .select()
    .from(farmers)
    .where(and(eq(farmers.collectorId, collectorId), eq(farmers.active, true)));

  // Today's entries
  const todayEntries = await getMilkEntriesForDate(collectorId, today);

  const todaysMilk = todayEntries.reduce((s, r) => s + r.entry.volume, 0);
  const todaysAmount = todayEntries.reduce((s, r) => s + r.entry.totalAmount, 0);

  // Last 7 days trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = sevenDaysAgo.toISOString().split('T')[0];

  const weekEntries = await db
    .select()
    .from(milkEntries)
    .where(and(eq(milkEntries.collectorId, collectorId), gte(milkEntries.date, fromDate)))
    .orderBy(milkEntries.date);

  // Group by date
  const byDate: Record<string, { liters: number; amount: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    byDate[d.toISOString().split('T')[0]] = { liters: 0, amount: 0 };
  }
  weekEntries.forEach((e) => {
    if (byDate[e.date]) {
      byDate[e.date].liters += e.volume;
      byDate[e.date].amount += e.totalAmount;
    }
  });

  const weeklyTrend = Object.entries(byDate).map(([date, vals]) => ({ date, ...vals }));

  return {
    totalFarmers: farmerRows.length,
    todaysMilkLiters: Math.round(todaysMilk * 10) / 10,
    todaysAmount: Math.round(todaysAmount),
    todaysEntries: todayEntries,
    weeklyTrend,
  };
}

export async function getMonthlyStats(collectorId: string, year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to = `${year}-${String(month).padStart(2, '0')}-31`;

  const entries = await db
    .select()
    .from(milkEntries)
    .where(and(
      eq(milkEntries.collectorId, collectorId),
      gte(milkEntries.date, from),
      lte(milkEntries.date, to)
    ));

  const totalLiters = entries.reduce((s, e) => s + e.volume, 0);
  const totalAmount = entries.reduce((s, e) => s + e.totalAmount, 0);

  return { totalLiters: Math.round(totalLiters * 10) / 10, totalAmount: Math.round(totalAmount), entryCount: entries.length };
}

// ─── PAYMENTS ────────────────────────────────────────────────

export async function addPayment(data: {
  farmerId: string; collectorId: string; amount: number;
  type: 'milk_payment' | 'cash_request' | 'withdrawal';
  period?: string; notes?: string;
}) {
  await db.insert(payments).values({
    id: generateId('p_'),
    farmerId: data.farmerId,
    collectorId: data.collectorId,
    amount: data.amount,
    type: data.type,
    status: 'paid',
    period: data.period,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  });
}

export async function getPaymentsByCollector(collectorId: string, limit = 50) {
  return db
    .select({ payment: payments, farmer: farmers })
    .from(payments)
    .innerJoin(farmers, eq(payments.farmerId, farmers.farmerId))
    .where(eq(payments.collectorId, collectorId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function getPaymentsByFarmer(farmerId: string, limit = 30) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.farmerId, farmerId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function getFarmerBalance(farmerId: string): Promise<number> {
  const allEntries = await getMilkEntriesForFarmer(farmerId, 1000);
  const totalEarned = allEntries.reduce((s, e) => s + e.totalAmount, 0);

  const allPayments = await getPaymentsByFarmer(farmerId, 1000);
  const totalPaid = allPayments
    .filter(p => p.type === 'milk_payment' || p.type === 'cash_request')
    .reduce((s, p) => s + p.amount, 0);

  return Math.round((totalEarned - totalPaid) * 100) / 100;
}

import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  role: text('role').notNull(),
  collectorId: text('collector_id'),
  farmerId: text('farmer_id'),
  passcode: text('passcode'),
  language: text('language').default('en'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const farmers = sqliteTable('farmers', {
  id: text('id').primaryKey(),
  farmerId: text('farmer_id').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  collectorId: text('collector_id').notNull(),
  bankAccount: text('bank_account'),
  ifsc: text('ifsc'),
  aadhar: text('aadhar'),
  upiId: text('upi_id'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const milkEntries = sqliteTable('milk_entries', {
  id: text('id').primaryKey(),
  farmerId: text('farmer_id').notNull(),
  collectorId: text('collector_id').notNull(),
  date: text('date').notNull(),
  shift: text('shift').notNull(),
  volume: real('volume').notNull(),
  fat: real('fat').notNull(),
  snf: real('snf').notNull(),
  ratePerLiter: real('rate_per_liter').notNull(),
  totalAmount: real('total_amount').notNull(),
  rateMethod: text('rate_method').notNull(),
  synced: integer('synced', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  farmerId: text('farmer_id').notNull(),
  collectorId: text('collector_id').notNull(),
  amount: real('amount').notNull(),
  type: text('type').notNull(),
  status: text('status').default('pending'),
  period: text('period'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

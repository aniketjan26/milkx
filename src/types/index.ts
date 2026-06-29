export type UserRole = 'collector' | 'farmer' | 'admin';
export type Shift = 'morning' | 'evening';
export type RateMethod = 'per_liter' | 'per_fat' | 'per_snf' | 'fixed';
export type PaymentStatus = 'pending' | 'paid' | 'partial';
export type Language = 'en' | 'hi' | 'pa';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  collectorId?: string;
  farmerId?: string;
  passcode?: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface Farmer {
  id: string;
  farmerId: string;
  name: string;
  phone: string;
  address?: string;
  collectorId: string;
  bankAccount?: string;
  ifsc?: string;
  aadhar?: string;
  upiId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MilkEntry {
  id: string;
  farmerId: string;
  collectorId: string;
  date: string;
  shift: Shift;
  volume: number;
  fat: number;
  snf: number;
  ratePerLiter: number;
  totalAmount: number;
  rateMethod: RateMethod;
  synced: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  farmerId: string;
  collectorId: string;
  amount: number;
  type: 'milk_payment' | 'cash_request' | 'withdrawal';
  status: PaymentStatus;
  period?: string;
  notes?: string;
  createdAt: string;
}

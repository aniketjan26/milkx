export type RateMethod = 'per_liter' | 'per_fat' | 'per_snf' | 'fixed';

interface CalcInput {
  volume: number;
  fat: number;
  snf: number;
  baseRate: number;
  method: RateMethod;
}

export function calculatePayment(input: CalcInput): {
  ratePerLiter: number;
  totalAmount: number;
  breakdown: string;
} {
  const { volume, fat, snf, baseRate, method } = input;
  switch (method) {
    case 'per_fat': {
      const rate = 25 + (fat - 3.5) * baseRate;
      return { ratePerLiter: +rate.toFixed(2), totalAmount: +(volume * rate).toFixed(2), breakdown: `${volume}L × ₹${rate.toFixed(2)}/L (Fat: ${fat}%)` };
    }
    case 'per_snf': {
      const rate = 25 + (snf - 8.5) * baseRate;
      return { ratePerLiter: +rate.toFixed(2), totalAmount: +(volume * rate).toFixed(2), breakdown: `${volume}L × ₹${rate.toFixed(2)}/L (SNF: ${snf}%)` };
    }
    default: {
      return { ratePerLiter: baseRate, totalAmount: +(volume * baseRate).toFixed(2), breakdown: `${volume}L × ₹${baseRate}/L` };
    }
  }
}

export function validateMilkQuality(fat: number, snf: number): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (fat < 2.5 || fat > 9.0) warnings.push(`Fat ${fat}% is outside normal range (2.5–9.0%)`);
  if (snf < 7.0 || snf > 11.0) warnings.push(`SNF ${snf}% is outside normal range (7.0–11.0%)`);
  return { valid: warnings.length === 0, warnings };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function generateId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

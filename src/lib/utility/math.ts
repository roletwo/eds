import { Decimal } from 'decimal.js';

export function n(value?: T_number): Decimal {
  return new Decimal(value || 0);
}

export type T_number = Decimal.Value;

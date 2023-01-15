import { Decimal } from 'decimal.js';

export function n(value?: Decimal.Value): Decimal {
  return new Decimal(value || 0);
}

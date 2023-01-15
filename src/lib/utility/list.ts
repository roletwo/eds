import { Decimal } from 'decimal.js';
import { n } from './math';

export function n_sum(list: Decimal[]): Decimal {
  return list.reduce((a, b) => a.add(b), n(0));
}

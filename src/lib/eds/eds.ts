/*
 |--------------------------------------------------------------------------
 | Exponential Distribute Share
 |--------------------------------------------------------------------------
 */

import { Decimal } from 'decimal.js';

export interface I_calc_min {
  /**
   * Total shares
   */
  share: number;
  /**
   * Total members to split shares
   */
  member: number;
  /**
   * How many times a member's share is greater than next member's
   */
  ratio: number;

  /**
   * Round function, default to: `Math.floor` pass `false` to prevent round
   */
  round_fn?: false | ((x: Decimal) => Decimal);

  /**
   * Decimal places to keep in no-rounding mode
   */
  dp?: number;
}

interface I_eds_list extends I_calc_min {}

/**
 * Calculate minimal member share
 */
export function calc_min({ share, member, ratio, round_fn, dp }: I_calc_min): Decimal {
  dp = dp || 17;
  round_fn = round_fn ?? ((value) => value.floor());

  const n_share = n(share);
  const n_ratio = n(ratio);
  let r = n_share.div(n(1).minus(n_ratio.pow(member)).div(n(1).minus(ratio)));

  if (round_fn) {
    r = round_fn(r);
    if (dp > 17) {
      throw new Error('{dp} should not be greater than 17');
    }
    r.toDP(dp);
  }

  return r;
}

/**
 * Calculate all member shares as a list
 */
export function calc_list({ share, member, ratio, round_fn, dp }: I_eds_list): Decimal[] {
  const min = calc_min({ share, member, ratio, round_fn: false, dp });
  let r = [min];
  let last: Decimal = min;
  for (let i = 1; i < member; i++) {
    last = last.times(ratio);
    r.push(last);
  }

  round_fn = round_fn ?? ((value) => value.floor());
  if (round_fn) {
    r = r.map(round_fn);
  }

  if (dp) {
    r = r.map((it) => it.toDP(dp));
  }

  return r.reverse();
}

export function n(value?: Decimal.Value): Decimal {
  return new Decimal(value || 0);
}

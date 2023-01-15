/*
 |--------------------------------------------------------------------------
 | Exponential Distribute Share
 |--------------------------------------------------------------------------
 */

import { Decimal } from 'decimal.js';
import { uniq } from 'lodash';
import { Invalid_argument_external } from '../../error/invalid_argument';
import { n } from '../utility/math';

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
export function cut({ share, member, ratio, round_fn, dp }: I_cut): Decimal[] {
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

/**
 * Calculate all member shares as a list from a poll list
 */
export function poll_cut({ poll, base_vote, base_share }: I_poll_cut, opt_list: I_cut): Decimal[] {
  base_vote = base_vote || 1;
  base_share = base_share || 0;
  const { dp } = opt_list;

  if (poll.length < 3) {
    throw new Invalid_argument_external('Poll members number should be greater than 2');
  }

  if (base_vote <= 0) {
    throw new Invalid_argument_external('{base_vote} should be greater than 0');
  }

  if (base_share < 0) {
    throw new Invalid_argument_external('{base_share} could not be negative');
  }

  if (poll.length !== opt_list.member) {
    throw new Invalid_argument_external('Invalid {poll} length, should be equal to {member}');
  }

  poll = poll.sort((a, b) => b - a);

  // members that passed base_vote
  const sharable = poll.filter((it) => it >= base_vote);
  // total shares of members not passed base_vote
  const base_share_sum = (poll.length - sharable.length) * base_share;
  // remaining shares
  const share = opt_list.share - base_share_sum;
  const member = sharable.length;
  const list = cut({ ...opt_list, share, member });
  const base_count = poll.length - sharable.length;
  const list_base = Array(base_count).fill(base_share);

  // The equity of members with the same number of votes should be equally distributed
  const uniq_vote = uniq(sharable);
  const uniq_map: Record<number /* votes */, { repeat: number; sum: Decimal; avg: Decimal }> = {};
  uniq_vote.forEach((it, i) => (uniq_map[it] = { repeat: 0, sum: n(0), avg: n(0) }));

  sharable.forEach((it, i) => {
    uniq_map[it].sum = uniq_map[it].sum.add(list[i]);
    if (it === sharable[i - 1]) {
      uniq_map[it].repeat++;
    }
  });

  for (const key in uniq_map) {
    const item = uniq_map[key];
    if (item.repeat) {
      item.avg = item.sum.div(item.repeat + 1);
    }
  }

  sharable.forEach((it, i) => {
    if (uniq_map[it].repeat) {
      list[i] = uniq_map[it].avg.toDP(dp);
    }
  });

  return [...list, ...list_base];
}

export interface I_poll_cut {
  /**
   * Vote count of each member
   */
  poll: number[];

  /**
   * Base share, even members with 0 votes will get this amount of shares
   */
  base_share: number;

  /**
   * Vote count, a member will receive base share if his votes is less than this value
   */
  base_vote: number;
}

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

interface I_cut extends I_calc_min {}

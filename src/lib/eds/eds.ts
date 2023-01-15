/*
 |--------------------------------------------------------------------------
 | Exponential Distribute Share
 |--------------------------------------------------------------------------
 */

import { Decimal } from 'decimal.js';
import { uniq } from 'lodash';
import { Invalid_argument_external } from '../../error/invalid_argument';
import { n_sum } from '../utility/list';
import { n, T_number } from '../utility/math';

export const max_dp = 17;
export const min_share = 1;

/**
 * Calculate minimal member share
 */
export function calc_min({ share, member, ratio, dp }: I_calc_min): Decimal {
  const n_share = n(share);
  const n_ratio = n(ratio);
  const r = n_share.div(n(1).minus(n_ratio.pow(member)).div(n(1).minus(ratio)));

  return to_dp(r);
}

/**
 * Calculate all member shares as a list once
 */
export function cut_once({ share, member, ratio, dp }: I_cut): Decimal[] {
  const min = calc_min({ share, member, ratio, dp });
  let r = [min];
  let last: Decimal = min;

  for (let i = 1; i < member; i++) {
    last = last.times(ratio);
    r.push(last);
  }

  r = r.map((it) => to_dp(it, dp));
  return r.reverse();
}

/**
 * Calculate all member shares as a list
 */
export function cut(opt: I_cut): Decimal[] {
  function fn(list: Decimal[], opt: I_cut): Decimal[] {
    const r = cut_once(opt);
    const { share } = opt;
    const sum = n_sum(r);
    const crumb = n(share).minus(sum);
    list.forEach((it, i) => (list[i] = it.add(r[i] || 0)));
    if (crumb.greaterThan(min_share)) {
      // try to cut crumb with fewer members
      const fewer = crumb.div(opt.share).times(opt.member).ceil().toNumber();
      fn(list, { ...opt, share: crumb, member: fewer });
    }

    return list;
  }

  // Add potential 1 crumb
  const r = fn(Array(opt.member).fill(n(0)), opt);
  return fill_final_crumb(opt.share, r);
}

function fill_final_crumb(share: T_number, list: Decimal[]): Decimal[] {
  const crumb_final = n(share).minus(n_sum(list));
  if (crumb_final.greaterThan(1)) {
    throw new Error('Final crumb is greater than 1');
  }
  list[0] = list[0].add(crumb_final.ceil());
  return list;
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
  const share = n(opt_list.share).minus(base_share_sum);
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
      list[i] = to_dp(uniq_map[it].avg);
    }
  });

  return fill_final_crumb(opt_list.share, [...list, ...list_base]);
}

function to_dp(value: Decimal, dp?: number): Decimal {
  if (dp) {
    if (dp > 17) {
      throw new Error('{dp} should not be greater than 17');
    }
    value = value.toDP(dp);
  } else {
    value = value.floor();
  }

  return value;
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
  share: T_number;

  /**
   * Total members to split shares
   */
  member: number;

  /**
   * How many times a member's share is greater than next member's
   */
  ratio: T_number;

  /**
   * Decimal places to keep in no-rounding mode
   */
  dp?: number;
}

interface I_cut extends I_calc_min {}

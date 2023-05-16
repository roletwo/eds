import { uniq } from 'lodash';
import { n_sum } from '../utility/list';
import { n } from '../utility/math';
import { calc_min, cut, cut_once, poll_cut } from './eds';

describe('calc_min', () => {
  it('common', async () => {
    const share = 90;
    const member = 2;
    const ratio = 2;
    const first = calc_min({ share: share, member: member, ratio: ratio });
    const v = first.toNumber();
    expect(v).toBe(30);
    expect(v + v * Math.pow(ratio, member - 1)).toBe(share);
  });
});

describe('cut_once', () => {
  it('common', async () => {
    const share = 90;
    const member = 2;
    const ratio = 2;
    const list = cut_once({ share, member, ratio });
    expect(list.map((it) => it.toNumber())).toEqual([60, 30]);
  });

  it('more', async () => {
    const share = 10000;
    const member = 100;
    const ratio = 1.01;
    const list = cut_once({ share, member, ratio });
    const sum = n_sum(list);
    expect(sum.toNumber() <= share).toBeTruthy();
  });
});

describe('cut', () => {
  it('common', async () => {
    const share = 90;
    const member = 2;
    const ratio = 2;
    const list = cut({ share, member, ratio });
    expect(list.map((it) => it.toNumber())).toEqual([60, 30]);
  });

  it('more', async () => {
    const share = 10000;
    const member = 100;
    const ratio = 1.01;
    const list = cut({ share, member, ratio });
    const sum = n_sum(list);
    expect(sum.toNumber()).toBe(share);
  });
});

describe('poll_cut', () => {
  it('common', async () => {
    const poll = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const share = 10000;
    const r = poll_cut(
      {
        poll,
        base_share: 10,
        base_vote: 6,
      },
      {
        share,
        member: 10,
        ratio: 1.1,
      },
    );

    expect(r.length).toBe(poll.length);
    const diff = n(share).minus(n_sum(r));
    expect(diff.eq(0)).toBeTruthy();
  });

  it('with 0 votes', async () => {
    const poll = [10, 9, 8, 7, 6, 5, 4, 0, 0, 0];
    const share = 10000;
    const r = poll_cut(
      {
        poll,
        base_share: 10,
        base_vote: 6,
      },
      {
        share,
        member: 10,
        ratio: 1.1,
      },
    );

    expect(r.length).toBe(poll.length);
    const diff = n(share).minus(n_sum(r));
    expect(diff.eq(0)).toBeTruthy();
  });

  it('all 0 vote', async () => {
    const poll = [0, 0, 0, 0, 0];
    const share = 10000;
    const base_share = 10;
    const r = poll_cut(
      {
        poll,
        base_share,
        base_vote: 1,
      },
      {
        share,
        member: 5,
        ratio: 1.1,
      },
    );

    expect(r.length).toBe(poll.length);
    expect(uniq(r).length).toBe(1);
    expect(r[0]).toBe(base_share);
  });

  it('all same vote', async () => {
    const poll = [10, 10, 10, 10, 10];
    const share = 10000;
    const base_share = 10;
    const r = poll_cut(
      {
        poll,
        base_share,
        base_vote: 1,
      },
      {
        share,
        member: 5,
        ratio: 1.1,
      },
    );

    expect(r.length).toBe(poll.length);
    expect(uniq(r).length).toBe(1);
    expect(r[0].toNumber()).toBe(share / r.length);
  });

  it('with vote duplications', async () => {
    const poll = [10, 10, 8, 8, 6, 5, 4, 3, 2, 1];
    const share = 10000;
    const r = poll_cut(
      {
        poll,
        base_share: 10,
        base_vote: 6,
      },
      {
        share,
        member: 10,
        ratio: 1.1,
      },
    );

    expect(r.length).toBe(poll.length);
    const diff = n(share).minus(n_sum(r));
    expect(diff.eq(0)).toBeTruthy();
  });
});

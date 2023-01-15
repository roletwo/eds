import { calc_min, cut, poll_cut } from './eds';

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
    const list = cut({ share, member, ratio, round_fn: false, dp: 2 });
    const sum = list.reduce((a, b) => a.add(b));
    expect(sum.toNumber() < share).toBeTruthy();
  });
});

describe('poll_cut', () => {
  it('common', async () => {
    const poll = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const r = poll_cut(
      {
        poll,
        base_share: 10,
        base_vote: 6,
      },
      {
        share: 10000,
        member: 10,
        ratio: 1.1,
      },
    );

    expect(r.length).toBe(poll.length);
  });
});

import { calc_list, calc_min } from './eds';

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

describe('calc_list', () => {
  it('common', async () => {
    const share = 90;
    const member = 2;
    const ratio = 2;
    const list = calc_list({ share, member, ratio });
    expect(list.map((it) => it.toNumber())).toEqual([60, 30]);
  });

  it('more', async () => {
    const share = 10000;
    const member = 100;
    const ratio = 1.01;
    const list = calc_list({ share, member, ratio, round_fn: false, dp: 2 });
    const sum = list.reduce((a, b) => a.add(b));
    expect(sum.toNumber() < share).toBeTruthy();
  });
});

const sm2Algorithm = require('../src/utils/sm2Algorithm');

describe('SuperMemo-2 (SM-2) Spaced Repetition Algorithm', () => {
  test('First review with Good quality (3) sets interval to 1 day and repetitions to 1', () => {
    const result = sm2Algorithm(3, 0, 2.5, 0);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easiness).toBeLessThanOrEqual(2.5);
    expect(result.nextReview).toBeInstanceOf(Date);
  });

  test('Second review with Easy quality (5) sets interval to 6 days and repetitions to 2', () => {
    const result = sm2Algorithm(5, 1, 2.5, 1);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
    expect(result.easiness).toBeGreaterThan(2.5);
  });

  test('Third review with Good quality (4) calculates interval = round(interval * easiness)', () => {
    const result = sm2Algorithm(4, 2, 2.6, 6);
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(Math.round(6 * 2.6));
  });

  test('Poor review quality (< 3, "Need Review") resets repetitions to 0 and interval to 1', () => {
    const result = sm2Algorithm(1, 4, 2.5, 18);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easiness).toBeLessThan(2.5);
  });

  test('Easiness factor never drops below minimum threshold of 1.3', () => {
    let ef = 1.4;
    for (let i = 0; i < 5; i++) {
      const res = sm2Algorithm(0, 0, ef, 1);
      ef = res.easiness;
    }
    expect(ef).toBeGreaterThanOrEqual(1.3);
  });
});


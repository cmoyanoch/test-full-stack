import { TtlCache } from './ttl-cache';

describe('TtlCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns undefined when ttl is 0', () => {
    const cache = new TtlCache<string>(10, 0);
    cache.set('a', 'x');
    expect(cache.get('a')).toBeUndefined();
  });

  it('evicts oldest entry when max size exceeded', () => {
    const cache = new TtlCache<string>(2, 60_000);
    cache.set('first', '1');
    cache.set('second', '2');
    cache.set('third', '3');
    expect(cache.get('first')).toBeUndefined();
    expect(cache.get('second')).toBe('2');
    expect(cache.get('third')).toBe('3');
  });

  it('drops expired entries on get', () => {
    const cache = new TtlCache<string>(10, 1000);
    cache.set('k', 'v');
    jest.advanceTimersByTime(1001);
    expect(cache.get('k')).toBeUndefined();
  });
});

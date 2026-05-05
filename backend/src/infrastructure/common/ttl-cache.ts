/**
 * Caché en memoria con TTL y límite de entradas (evicción FIFO).
 * No es LRU; prioriza simplicidad y cota de memoria.
 */
export class TtlCache<T> {
  private readonly store = new Map<
    string,
    { value: T; expiresAt: number }
  >();

  constructor(
    private readonly maxSize: number,
    private readonly ttlMs: number,
  ) {}

  get(key: string): T | undefined {
    if (this.ttlMs <= 0) {
      return undefined;
    }
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.ttlMs <= 0) {
      return;
    }
    while (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value as string | undefined;
      if (oldest === undefined) {
        break;
      }
      this.store.delete(oldest);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }
}

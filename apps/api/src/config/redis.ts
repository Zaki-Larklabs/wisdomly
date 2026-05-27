// Simple in-memory fallback for Redis to allow dev runs without external Redis dependency
class InMemoryRedis {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {
    this.store.set(key, value);
    if (options?.ex) {
      setTimeout(() => {
        this.store.delete(key);
      }, options.ex * 1000);
    }
    return 'OK';
  }
}

export const redis = new InMemoryRedis();

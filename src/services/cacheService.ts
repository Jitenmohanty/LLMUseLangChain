import Redis from "ioredis";
import crypto from "crypto";
import { env } from "../config/env";

type CacheEntry<T> = {
  cached_at: string;
  cache_key: string;
  data: T;
};

class InMemoryCache {
  private store = new Map<string, { value: any; expiresAt: number }>();
  get<T>(key: string): T | null {
    const ent = this.store.get(key);
    if (!ent) return null;
    if (Date.now() > ent.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return ent.value as T;
  }
  set(key: string, value: any, ttlSeconds: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
  keys(pattern: string) {
    return Array.from(this.store.keys()).filter(k => k.includes(pattern.replace("*", "")));
  }
  del(...keys: string[]) {
    keys.forEach(k => this.store.delete(k));
  }
  getStats() {
    return { type: "in_memory", totalKeys: this.store.size };
  }
}

export class CacheService {
  private client: Redis | InMemoryCache;
  private defaultTtl = 3600 * 24;

  constructor() {
    try {
      this.client = new Redis(env.REDIS_URL);
      this.client.on("error", (e) => console.warn("Redis error:", e));
    } catch (e) {
      console.warn("Falling back to in-memory cache");
      this.client = new InMemoryCache();
    }
  }

  private makeKey(prefix: string, identifier: string) {
    const hash = crypto.createHash("md5").update(identifier).digest("hex");
    return `${prefix}:${hash}`;
  }

  async getCachedReport<T>(query: string): Promise<CacheEntry<T> | null> {
    const key = this.makeKey("report", query.toLowerCase().trim());
    if (this.client instanceof Redis) {
      const raw = await this.client.get(key);
      return raw ? JSON.parse(raw) : null;
    } else {
      return (this.client as InMemoryCache).get<CacheEntry<T>>(key);
    }
  }

  async cacheReport<T>(query: string, reportData: T, ttl?: number) {
    const key = this.makeKey("report", query.toLowerCase().trim());
    const entry: CacheEntry<T> = {
      cached_at: new Date().toISOString(),
      cache_key: key,
      data: reportData
    };
    const payload = JSON.stringify(entry);
    const finalTtl = ttl ?? this.defaultTtl;
    if (this.client instanceof Redis) {
      await this.client.setex(key, finalTtl, payload);
    } else {
      (this.client as InMemoryCache).set(key, entry, finalTtl);
    }
  }

  async invalidate(pattern: string) {
    if (this.client instanceof Redis) {
      const keys = await this.client.keys(pattern);
      if (keys.length) await this.client.del(...keys);
    } else {
      const keys = (this.client as InMemoryCache).keys(pattern);
      (this.client as InMemoryCache).del(...keys);
    }
  }

  async stats() {
    if (this.client instanceof Redis) {
      const info = await this.client.info();
      return { type: "redis", info };
    } else {
      return (this.client as InMemoryCache).getStats();
    }
  }
}

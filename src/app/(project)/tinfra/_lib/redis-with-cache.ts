// lib/with-cache.ts

import { redis } from "./redis";

export async function redisWithCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const data = await fn();
  await redis.set(key, data, { ex: ttl });
  return data;
}

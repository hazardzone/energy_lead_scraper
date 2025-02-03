// Create lib/cache.js (Redis integration)
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

export async function cacheLeads(key, data, ttl = 3600) {
  await redisClient.set(key, JSON.stringify(data), { EX: ttl });
}

export async function getCachedLeads(key) {
  const cachedData = await redisClient.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
}
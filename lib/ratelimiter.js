import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Limit: 10 requests per IP every 60 seconds
export async function rateLimiter(ip) {
  const key = `rate-limit:${ip}`;
  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, 60); // Set expiration for 60 seconds
  }

  return currentCount > 10; // Block if more than 10 requests
}
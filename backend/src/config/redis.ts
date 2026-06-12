import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 200, 1000);
  },
});

redis.on('connect', () => console.log('✅  Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

// Cache helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await redis.del(...keys);
  },

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
  },
};

export const CACHE_KEYS = {
  userProfile: (userId: string) => `user:${userId}:profile`,
  startup: (startupId: string) => `startup:${startupId}`,
  simulation: (startupId: string) => `simulation:${startupId}`,
  userStartups: (userId: string) => `user:${userId}:startups`,
};

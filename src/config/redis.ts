import IORedis from 'ioredis';
import { logger } from '../utils/logger';

const isDevelopment = process.env.NODE_ENV === 'development';

const redis = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: isDevelopment ? undefined : process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      logger.error('Redis connection failed after 3 retries');
      return null;
    }
    const delay = Math.min(times * 200, 2000);
    return delay;
  }
});

redis.on('error', (error: Error) => {
  logger.error('Redis connection error:', error);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

export default redis; 
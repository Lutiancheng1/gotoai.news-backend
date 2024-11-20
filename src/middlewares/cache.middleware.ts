import { Response, NextFunction } from 'express';
import redis from '../config/redis';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

interface CacheOptions {
  expire?: number;
  key?: (req: AuthRequest) => string;
}

const defaultOptions: CacheOptions = {
  expire: 300,
  key: (req: AuthRequest) => `${req.originalUrl}`,
};

export const cache = (options: CacheOptions = {}) => {
  const { expire, key } = { ...defaultOptions, ...options };

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = key?.(req) || `${req.originalUrl}`;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);
      res.json = function (data: any) {
        redis.setex(cacheKey, expire!, JSON.stringify(data))
          .catch((err: any) => logger.error('Redis cache error:', err));
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// 清除缓存的方法
export const clearCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
  }
}; 
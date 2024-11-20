import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis';

// 白名单配置
const whitelist = ['127.0.0.1', 'localhost'];

// 创建 RedisStore 实例
const createRedisStore = (prefix: string) => new RedisStore({
  sendCommand: async (...args: string[]): Promise<any> => {
    const result = await redis.call(args[0], ...args.slice(1));
    return result as any;
  },
  prefix,
});

// API 通用限流
export const apiLimiter = rateLimit({
  store: createRedisStore('rate-limit-api:'),
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  skip: (req) => {
    const clientIp = req.ip || '';
    return whitelist.includes(clientIp);
  },
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录接口限流
export const loginLimiter = rateLimit({
  store: createRedisStore('rate-limit-login:'),
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 限制每个IP 1小时内最多5次失败的登录尝试
  skip: (req) => {
    const clientIp = req.ip || '';
    return whitelist.includes(clientIp);
  },
  message: {
    status: 'error',
    message: '登录失败次数过多，请1小时后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 
export const rateLimitConfig = {
  api: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      status: 'error',
      message: '请求过于频繁，请稍后再试'
    }
  },
  login: {
    windowMs: 60 * 60 * 1000, 
    max: 5,
    message: {
      status: 'error',
      message: '登录失败次数过多，请1小时后再试'
    }
  }
}; 
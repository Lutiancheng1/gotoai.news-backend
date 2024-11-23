import mongoose from 'mongoose';
import User from '../models/user.model';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const enableAdmin = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.error('MongoDB URI is not defined in environment variables');
    return;
  }

  try {
    // 检查是否已经连接
    if (mongoose.connection.readyState === 1) {
      logger.info('Using existing MongoDB connection ✅');
    } else {
      logger.info('Creating new MongoDB connection ✅');
      await mongoose.connect(mongoUri);
    }

    // 查找并启用超级管理员账户
    const admin = await User.findOneAndUpdate(
      { username: 'admin' },
      { status: 'active' },
      { new: true }
    );

    if (admin) {
      logger.info('Admin account has been enabled successfully ✅');
    } else {
      logger.error('Admin account not found ❌');
    }

    // 关闭数据库连接
    await mongoose.connection.close();
    
  } catch (error) {
    logger.error('Error enabling admin account: ❌', error);
  }
};

// 执行脚本
enableAdmin(); 
import mongoose from 'mongoose';
import User from '../models/user.model';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const initAdmin = async () => {
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

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      logger.info('Admin account already exists ✅');
      return;
    }

    const adminData = {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin' as const,
    };

    const admin = new User(adminData);
    await admin.save();
    logger.info('Admin account created successfully');

  } catch (error) {
    logger.error('Error creating admin account: ❌', error);
    // 不要在这里退出进程，让应用继续运行
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initAdmin().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default initAdmin; 
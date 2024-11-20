import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter, loginLimiter } from './middlewares/rateLimit.middleware';
import { logger } from './utils/logger';
import initAdmin from './scripts/initAdmin';

// Routes
import authRoutes from './routes/auth.routes';
import jobRoutes from './routes/job.routes';
import newsRoutes from './routes/news.routes';
import talentRoutes from './routes/talent.routes';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
// 为登录路由单独应用限流中间件
app.use('/api/auth/login', loginLimiter);
app.use('/api/jobs', jobRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/talents', talentRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

// 初始化数据库并启动服务器
const initializeAndStart = async () => {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info('Connected to MongoDB');

    // 初始化管理员账户
    await initAdmin();

    // 启动服务器
    const port = process.env.PORT || 5001;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeAndStart();

export default app; 
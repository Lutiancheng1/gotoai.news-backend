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
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';

// Routes
import authRoutes from './routes/auth.routes';
import newsRoutes from './routes/news.routes';
import talentRoutes from './routes/talent.routes';
import usersRoutes from './routes/users.routes';
import categoryRoutes from './routes/category.routes';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  // origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Cross-Origin-Resource-Policy']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/talents', talentRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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
    const port = process.env.PORT || 5002;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`API docs: http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    logger.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeAndStart();

export default app; 
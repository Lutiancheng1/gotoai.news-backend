import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';

export class UsersController {
  // 获取所有用户列表
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // 构建查询条件
      const query: any = {};
      if (req.query.username) {
        query.username = { $regex: req.query.username, $options: 'i' };
      }
      if (req.query.email) {
        query.email = { $regex: req.query.email, $options: 'i' };
      }

      // 如果是普通用户，只能看到非管理员用户
      if (req.query?.role === 'user') {
        query.role = { $ne: 'admin' } ;
      }

      // 获取总数
      const total = await User.countDocuments(query);

      // 获取分页数据
      const users = await User.find(
        query,
        { password: 0 }
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      res.status(200).json({
        status: 'success',
        data: {
          users,
          total,
          page,
          limit
        }
      });
    } catch (error) {
      logger.error('Error getting users:', error);
      next(new AppError('获取用户列表失败', 500));
    }
  }

  // 获取单个用户
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id, { password: 0 });
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      logger.error('Error getting user:', error);
      next(new AppError('获取用户信息失败', 500));
    }
  }

  // 更新用户
  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, email, role } = req.body;
      const currentUser = await User.findById(req.user?.userId);
      const targetUser = await User.findById(req.params.id);

      if (!targetUser) {
        return next(new AppError('用户不存在', 404));
      }

      // 构建更新对象
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;

      // 只有超级管理员可以修改角色
      if (role && currentUser?.username === 'admin') {
        updateData.role = role;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      res.status(200).json({
        status: 'success',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      next(new AppError('更新用户信息失败', 500));
    }
  }

  // 删除用户
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }

      // 不允许删除管理员账户
      if (user.role === 'admin') {
        return next(new AppError('不能删除管理员账户', 403));
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({
        status: 'success',
        message: '用户删除成功'
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      next(new AppError('删除用户失败', 500));
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password, role } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return next(new AppError('用户名或邮箱已存在', 400));
      }

      const user = new User({
        username,
        email,
        password,
        role,
        status: 'active',
      });

      await user.save();

      // 不返回密码字段
      const userResponse = user.toPublicJSON();
        
      res.status(201).json({
        status: 'success',
        data: { user: userResponse }
      });
    } catch (error) {
      next(new AppError('创建用户失败', 500));
    }
  }

  static async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }

      if (user.role === 'admin' && user.username === 'admin') {
        return res.status(403).json({
          status: 'error',
          message: '不能修改超级管理员状态'
        });
      }

      user.status = user.status === 'active' ? 'inactive' : 'active';
      await user.save();

      res.json({
        status: 'success',
        data: {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
          }
        }
      });
    } catch (error) {
      next(new AppError('更新用户状态失败', 500));
    }
  }
} 
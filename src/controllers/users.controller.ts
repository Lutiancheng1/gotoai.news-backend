import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';
import jwt from 'jsonwebtoken';
import News from '../models/news.model';
import Category from '../models/category.model';
import Talent from '../models/talent.model';

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
      const { username, email, role, status } = req.body;
      const currentUser = await User.findById(req.user?.userId);
      const targetUser = await User.findById(req.params.id);

      if (!targetUser) {
        return next(new AppError('用户不存在', 404));
      }

      // 特别保护超级管理员
      if (targetUser.username === 'admin' && targetUser.role === 'admin') {
        return next(new AppError('不能修改超级管理员的信息', 403));
      }

      // 构建更新对象
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;

      // 角色修改逻辑
      if (role) {
        // 超级管理员可以修改任何人的角色
        if (currentUser?.username === 'admin') {
          updateData.role = role;
        } 
        // 普通管理员只能修改其他用户的角色
        else if (currentUser?.role === 'admin' && currentUser._id.toString() !== targetUser._id.toString()) {
          updateData.role = role;
        }
      }

      // 状态修改逻辑
      if (status) {
        // 不能修改自己的状态
        if (currentUser?._id.toString() === targetUser._id.toString()) {
          return next(new AppError('不能修改自己的状态', 403));
        }
        updateData.status = status;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      // 如果修改的是当前用户的角色，生成新�� token
      if (currentUser?._id.toString() === targetUser._id.toString() && role) {
        const token = jwt.sign(
          { userId: updatedUser!._id, role: updatedUser!.role },
          process.env.JWT_SECRET!,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
          status: 'success',
          data: { 
            user: updatedUser,
            token // 返回新的 token
          }
        });
      } else {
        res.status(200).json({
          status: 'success',
          data: { user: updatedUser }
        });
      }
    } catch (error) {
      logger.error('Error updating user:', error);
      next(new AppError('更新用户信息失败', 500));
    }
  }

  // 删除用户
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user?.userId);
      
      if (!user || !currentUser) {
        return next(new AppError('用户不存在', 404));
      }

      // 不允许删除管理员账户
      if (user.role === 'admin' && user.username === 'admin') {
        return next(new AppError('不能删除超级管理员账户', 403));
      }

      // 记录数据转移前的统计
      const newsCount = await News.countDocuments({ author: user._id });
      const categoryCount = await Category.countDocuments({ createdBy: user._id });
      const talentCount = await Talent.countDocuments({ createdBy: user._id });

      // 更新所有关联数据
      await Promise.all([
        News.updateMany(
          { author: user._id },
          { author: currentUser._id, updatedBy: currentUser._id }
        ),
        Category.updateMany(
          { createdBy: user._id },
          { createdBy: currentUser._id, updatedBy: currentUser._id }
        ),
        Talent.updateMany(
          { createdBy: user._id },
          { createdBy: currentUser._id, updatedBy: currentUser._id }
        )
      ]);

      // 记录操作日志
      logger.info(`用户删除操作 - 执行者: ${currentUser.username}(${currentUser._id}), 被删除用户: ${user.username}(${user._id})`);
      logger.info(`数据转移统计 - 新闻: ${newsCount}条, 分类: ${categoryCount}个, 人才信息: ${talentCount}条`);

      // 删除用户
      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({
        status: 'success',
        message: '用户删除成功',
        data: {
          transferStats: {
            news: newsCount,
            categories: categoryCount,
            talents: talentCount
          }
        }
      });
    } catch (error) {
      logger.error('删除用户失败:', error);
      next(new AppError('删除用户失败', 500));
    }
  }
  // 创建用户
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
      const currentUser = await User.findById(req.user?.userId);
      
      if (!user) {
        return next(new AppError('用户不存在', 404));
      }

      // 检查是否是超级管理员
      if (user.role === 'admin' && user.username === 'admin') {
        return res.status(403).json({
          status: 'error',
          message: '不能修改超级管理员状态'
        });
      }

      // 检查是否在停用自己的账户
      if (currentUser?._id.toString() === user._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: '不能停用自己的账户'
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
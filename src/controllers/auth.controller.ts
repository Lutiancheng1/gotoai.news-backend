import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { validateEmail } from '../utils/validators';
import { AuthRequest } from '../types';

export class AuthController {
  // 用户注册
  static async register(req: AuthRequest, res: Response) {
    try {
      const { username, email, password } = req.body;

      // 验证邮箱格式
      if (!validateEmail(email)) {
        return res.status(400).json({ message: '无效的邮箱格式' });
      }

      // 检查用户是否已存在
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: '用户名或邮箱已存在' });
      }

      // 创建新用户
      const user = new User({
        username,
        email,
        password,
        role: 'editor', // 默认角色
      });

      await user.save();

      // 生成 JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 用户登录
  static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      // 查找用户
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: '邮箱或密码错误' });
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: '邮箱或密码错误' });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 更新用户信息
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { username, email } = req.body;
      const userId = req.user?.userId;

      // 检查邮箱是否已被其他用户使用
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: '该邮箱已被使用' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { username, email },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json({
        message: '个人信息更新成功',
        user,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }
} 
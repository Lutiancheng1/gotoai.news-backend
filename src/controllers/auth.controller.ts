import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { validateEmail } from '../utils/validators';
import { AuthRequest } from '../types';

export class AuthController {
  // 用户登录
  static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ status: 'error', message: '邮箱或密码错误' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ status: 'error', message: '账号已被停用，请联系管理员' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ status: 'error', message: '邮箱或密码错误' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 'success',
        message: '登录成功',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?.userId).select('-password');
      if (!user) {
        return res.status(404).json({ status: 'error', message: '用户不存在' });
      }
      
      // 更新 token 中的角色信息
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({ 
        status: 'success', 
        data: { 
          user,
          token // 返回新的 token
        } 
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { username, email, currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user?.userId);

      if (!user) {
        return res.status(404).json({ 
          status: 'error', 
          message: '用户不存在' 
        });
      }

      // 如果要修改密码，先验证当前密码
      if (newPassword) {
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
          return res.status(400).json({ 
            status: 'error', 
            message: '当前密码不正确' 
          });
        }
        user.password = newPassword;
      }

      // 检查用户名是否已存在
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ 
            status: 'error', 
            message: '用户名已存在' 
          });
        }
        user.username = username;
      }

      // 检查邮箱是否已存在
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ 
            status: 'error', 
            message: '邮箱已存在' 
          });
        }
        user.email = email;
      }

      await user.save();

      // 生成新的 token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: 'success',
        message: '个人信息更新成功',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
          },
          token
        }
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: '服务器错误', 
        error 
      });
    }
  }
} 
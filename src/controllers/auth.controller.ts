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
      res.json({ status: 'success', data: user });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }
} 
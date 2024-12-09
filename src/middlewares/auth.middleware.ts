import { Response, NextFunction, RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthRequest } from '../types';
import User from '../models/user.model';
import type { IUser } from '../models/user.model'; // 添加这行
import News from '../models/news.model';
import Category from '../models/category.model';
import Talent from '../models/talent.model';
import Employment from '../models/employment.model';

export const auth: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: '未登录' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: '用户不存在' });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({ message: '账号已被停用，请联系管理员' });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(401).json({ message: '认证失败' });
  }
};

export const adminOnly: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.role?.includes('admin')) {
      res.status(403).json({ message: '需要管理员权限' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const superAdminOnly: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (user?.username !== 'admin') {
      res.status(403).json({ message: '需要超级管理员权限' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const canModifyUser: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?.userId) as IUser;
    const targetUser = await User.findById(req.params.id) as IUser;

    if (!currentUser || !targetUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    if (targetUser.username === 'admin') {
      res.status(403).json({ message: '不能修改超级管理员' });
      return;
    }

    if (currentUser.username === 'admin') {
      next();
      return;
    }

    if (currentUser._id.toString() === targetUser._id.toString() && req.body.status) {
      res.status(403).json({ message: '不能修改自己的状态' });
      return;
    }

    if (currentUser.role === 'admin' && currentUser._id.toString() !== targetUser._id.toString()) {
      next();
      return;
    }

    if (currentUser._id.toString() === targetUser._id.toString()) {
      if (req.body.role || req.body.status) {
        res.status(403).json({ message: '不能修改自己的角色或状态' });
        return;
      }
      next();
      return;
    }

    res.status(403).json({ message: '没有权限修改该用户' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const canModifyNews: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?.userId);
    const news = await News.findById(req.params.id);

    if (!currentUser || !news) {
      res.status(404).json({ message: '新闻或用户不存在' });
      return;
    }

    if (currentUser.username === 'admin' || currentUser.role === 'admin') {
      next();
      return;
    }

    if (news.author.toString() === currentUser._id.toString()) {
      next();
      return;
    }

    res.status(403).json({ message: '没有权限修改该新闻' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const canModifyCategory: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?.userId);
    const category = await Category.findById(req.params.id);

    if (!currentUser || !category) {
      res.status(404).json({ message: '分类或用户不存在' });
      return;
    }

    if (currentUser.role === 'admin' || category.createdBy.toString() === currentUser._id.toString()) {
      next();
      return;
    }

    res.status(403).json({ message: '没有权限修改该分类' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const canModifyTalent: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?.userId);
    const talent = await Talent.findById(req.params.id);

    if (!currentUser || !talent) {
      res.status(404).json({ message: '人才信息或用户不存在' });
      return;
    }

    if (currentUser.role === 'admin') {
      next();
      return;
    }

    if (talent.recommendedBy.toString() === currentUser._id.toString()) {
      next();
      return;
    }

    res.status(403).json({ message: '没有权限修改该人才信息' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const canModifyEmployment: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?.userId);
    const employment = await Employment.findById(req.params.id);

    if (!currentUser || !employment) {
      res.status(404).json({ message: '就业资讯或用户不存在' });
      return;
    }

    if (currentUser.role === 'admin') {
      next();
      return;
    }

    if (employment.author.toString() === currentUser._id.toString()) {
      next();
      return;
    }

    res.status(403).json({ message: '没有权限修改该就业资讯' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
}; 
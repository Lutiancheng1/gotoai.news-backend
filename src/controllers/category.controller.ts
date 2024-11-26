import { Request, Response } from 'express';
import Category from '../models/category.model';
import { AuthRequest } from '../types';
import User from '../models/user.model';
import News from '../models/news.model';
export class CategoryController {
  // 获取分类列表
  static async getList(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const keyword = req.query.keyword as string;

      const query: any = {};

      if (keyword) {
        query.name = { $regex: keyword, $options: 'i' };
      }

      const total = await Category.countDocuments(query);
      const categories = await Category.find(query)
        .populate('createdBy', 'username') // 填充创建者信息
        .populate('updatedBy', 'username') // 填充更新者信息
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        status: 'success',
        data: {
          categories,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: '服务器错误', 
        error 
      });
    }
  }

  // 获取所有分类（不分页，用于下拉选择）
  static async getAll(req: Request, res: Response) {
    try {
      const categories = await Category.find()
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username')
        .sort('-createdAt');

      res.json({
        status: 'success',
        data: {
          categories
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

  // 创建分类
  static async create(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;

      // 检查分类名是否已存在
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ 
          status: 'error',
          message: '分类名已存在' 
        });
      }

      const category = await Category.create({
        name,
        createdBy: req.user?.userId,
      });
      await category.populate('createdBy', 'username');

      res.status(201).json({
        status: 'success',
        message: '分类创建成功',
        data: {
          category
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

  // 更新分类
  static async update(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({ 
          status: 'error',
          message: '分类不存在' 
        });
      }

      // 检查权限
      const currentUser = await User.findById(req.user?.userId);
      if (!currentUser) {
        return res.status(404).json({ 
          status: 'error',
          message: '用户不存在' 
        });
      }

      if (currentUser.role !== 'admin' && category.createdBy.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ 
          status: 'error',
          message: '没有权限修改此分类' 
        });
      }

      // 检查新名称是否与其他分类重复
      const existingCategory = await Category.findOne({ 
        name, 
        _id: { $ne: req.params.id } 
      });
      if (existingCategory) {
        return res.status(400).json({ 
          status: 'error',
          message: '分类名已存在' 
        });
      }

      // 先获取旧的分类名
      const oldCategoryName = category.name;

      // 更新分类
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        { 
          name,
          updatedBy: req.user?.userId,
        },
        { new: true }
      ).populate('createdBy', 'username')
        .populate('updatedBy', 'username');

      // 更新所有使用此分类的新闻
      await News.updateMany(
        { category: oldCategoryName },
        { category: name }
      );

      res.json({
        status: 'success',
        message: '分类更新成功',
        data: {
          category: updatedCategory
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

  // 删除分类
  static async delete(req: AuthRequest, res: Response) {
    try {
      const category = await Category.findById(req.params.id);
      const currentUser = await User.findById(req.user?.userId);
      
      if (!category) {
        return res.status(404).json({ 
          status: 'error',
          message: '分类不存在' 
        });
      }

      // 检查权限：管理员可以删除任何分类，普通用户只能删除自己创建的分类
      if (currentUser?.role !== 'admin' && 
          currentUser?.username !== 'admin' && 
          category.createdBy.toString() !== currentUser?._id.toString()) {
        return res.status(403).json({ 
          status: 'error',
          message: '没有权限删除此分类' 
        });
      }

      // 检查是否有新闻使用此分类
      const newsCount = await News.countDocuments({ category: category.name });
      if (newsCount > 0) {
        return res.status(400).json({ 
          status: 'error',
          message: `该分类下还有 ${newsCount} 条新闻，请先处理关联的新闻后再删除` 
        });
      }

      await Category.findByIdAndDelete(req.params.id);

      res.json({ 
        status: 'success',
        message: '分类删除成功'
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
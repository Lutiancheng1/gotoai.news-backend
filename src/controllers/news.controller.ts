import { Request, Response } from 'express';
import News from '../models/news.model';
import { AuthRequest } from '../types/auth';

export class NewsController {
  // 创建新闻
  static async create(req: AuthRequest, res: Response) {
    try {
      const { title, content, summary, category, tags } = req.body;
      const cover = req.file?.path;

      const news = new News({
        title,
        content,
        summary,
        category,
        tags,
        cover: cover || '',
        author: req.user?.userId,
      });

      await news.save();

      res.status(201).json({
        message: '新闻创建成功',
        news,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 获取新闻列表
  static async getList(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const status = req.query.status as string;
      const keyword = req.query.keyword as string;

      const query: any = {};

      if (category) {
        query.category = category;
      }

      if (status) {
        query.status = status;
      }

      if (keyword) {
        query.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { summary: { $regex: keyword, $options: 'i' } },
        ];
      }

      const total = await News.countDocuments(query);
      const news = await News.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        news,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 获取新闻详情
  static async getDetail(req: Request, res: Response) {
    try {
      const news = await News.findById(req.params.id)
        .populate('author', 'username');

      if (!news) {
        return res.status(404).json({ message: '新闻不存在' });
      }

      // 更新浏览次数
      news.viewCount += 1;
      await news.save();

      res.json(news);
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 更新新闻
  static async update(req: AuthRequest, res: Response) {
    try {
      const { title, content, summary, category, tags, status } = req.body;
      const cover = req.file?.path;

      const news = await News.findById(req.params.id);

      if (!news) {
        return res.status(404).json({ message: '新闻不存在' });
      }

      // 检查权限
      if (news.author.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: '没有权限修改此新闻' });
      }

      const updateData: any = {
        title,
        content,
        summary,
        category,
        tags,
        status,
      };

      if (cover) {
        updateData.cover = cover;
      }

      const updatedNews = await News.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('author', 'username');

      res.json({
        message: '新闻更新成功',
        news: updatedNews,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 删除新闻
  static async delete(req: AuthRequest, res: Response) {
    try {
      const news = await News.findById(req.params.id);

      if (!news) {
        return res.status(404).json({ message: '新闻不存在' });
      }

      // 检查权限
      if (news.author.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: '没有权限删除此新闻' });
      }

      await news.deleteOne();

      res.json({ message: '新闻删除成功' });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }
} 
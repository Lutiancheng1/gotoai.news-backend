import { Request, Response } from 'express';
import News from '../models/news.model';
import { AuthRequest } from '../types/auth';
import User from '../models/user.model';

export class NewsController {
  // 创建新闻
  static async create(req: AuthRequest, res: Response) {
    try {
      const { title, content, category, status = 'draft', cover } = req.body;
      const summary = content.substring(0, 200);

      const news = await News.create({
        title,
        content,
        summary,
        category,
        status,
        cover: cover || null,
        author: req.user?.userId,
      });

      const populatedNews = await News.findById(news._id)
        .populate('author', 'username')
        .populate('cover');

      res.status(201).json({
        status: 'success',
        data: { news: populatedNews },
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 获取新闻列表
  static async getList(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, title, category, author, status } = req.query;
      const query: any = {};

      if (title) {
        query.title = new RegExp(title as string, 'i');
      }
      if (category) {
        query.category = category;
      }
      if (author) {
        // 先通过用户名查找用户
        const user = await User.findOne({ username: new RegExp(author as string, 'i') });
        if (user) {
          query.author = user._id;
        } else {
          // 如果找不到用户，返回空结果
          return res.json({
            status: 'success',
            data: {
              news: [],
              pagination: {
                total: 0,
                page: Number(page),
                pages: 0
              }
            }
          });
        }
      }
      if (status) {
        query.status = status;
      }

      const total = await News.countDocuments(query);
      const news = await News.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      res.json({
        status: 'success',
        data: {
          news,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
          }
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

  // 获取新闻详情
  static async getDetail(req: Request, res: Response) {
    try {
      const news = await News.findById(req.params.id)
        .populate('author', 'username');

      if (!news) {
        return res.status(404).json({ 
          status: 'error',
          message: '新闻不存在' 
        });
      }

      res.json({
        status: 'success',
        data: {
          news
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

  // 更新新闻
  static async update(req: AuthRequest, res: Response) {
    try {
      const { title, content, category, status, cover } = req.body;
      const news = await News.findById(req.params.id);

      if (!news) {
        return res.status(404).json({ status: 'error', message: '新闻不存在' });
      }

      const authorId = news.author.toString();
      const userId = req.user?.userId.toString();
      const userRole = req.user?.role;

      if (authorId !== userId && userRole !== 'admin') {
        return res.status(403).json({ status: 'error', message: '没有权限修改此新闻' });
      }

      const summary = content.substring(0, 20);
      const updateData: any = { title, content, summary, category, status };
      // 如果 avatar 字段存在于请求中，则更新它
      if (req.body.hasOwnProperty('cover')) {
        updateData.cover = cover || null; // 如果 avatar 为空，则设置为 null
      } 
      const updatedNews = await News.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('author', 'username');

      res.json({
        status: 'success',
        message: '新闻更新成功',
        data: { news: updatedNews },
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 删除新闻
  static async delete(req: AuthRequest, res: Response) {
    try {
      const news = await News.findById(req.params.id);

      if (!news) {
        return res.status(404).json({ status: 'error', message: '新闻不存在' });
      }

      if (news.author.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: '没有权限删除此新闻' });
      }

      await news.deleteOne();

      res.json({ status: 'success', message: '新闻删除成功' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }
} 
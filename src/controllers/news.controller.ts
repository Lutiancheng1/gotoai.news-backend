import { Request, Response } from 'express';
import News from '../models/news.model';
import { AuthRequest } from '../types/auth';
import User from '../models/user.model';
import { getTextFromMarkdown ,handleBase64Images, getNewsSummary} from '../utils/utils';
import File from '../models/file.model';
import fs from 'fs';

export class NewsController {
  // 创建新闻
  static async create(req: AuthRequest, res: Response) {
    try {
      const { title, content, category, status = 'draft', cover } = req.body;
      
      // 先创建新闻记录，使用原始内容
      const news = await News.create({
        title,
        content,  // 使用原始内容先创建
        summary: getNewsSummary(getTextFromMarkdown(content)),
        category,
        status,
        cover: cover || null,
        author: req.user?.userId,
      });

      // 处理内容中的 base64 图片，传入新闻 ID 和标题
      const processedContent = await handleBase64Images(content, req.user?.userId || '', {
        newsId: news._id as string,
        title: title
      });

      // 更新新闻内容
      news.content = processedContent;
      await news.save();

      res.status(201).json({
        status: 'success',
        message: '新闻创建成功',
        data: news
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
  // 获取所有新闻（不分页）
  static async getAllNews(req: Request, res: Response) {
  try {
    const { title, category, author, status } = req.query;
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
            news: []
          }
        });
      }
    }
    if (status) {
      query.status = status;
    }

    const news = await News.find(query)
      .populate('author', 'username')
      .populate('cover')
      .sort({ createdAt: -1 });

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
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // 如果更新内容，重新生成摘要
      if (updateData.content) {
        const processedContent = await handleBase64Images(updateData.content, req.user?.userId || '', {
          newsId: id,
          title: updateData.title
        });
        updateData.content = processedContent;
        updateData.summary = getNewsSummary(getTextFromMarkdown(updateData.content));
      }

      const news = await News.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('author', 'username').populate('cover');

      if (!news) {
        return res.status(404).json({ status: 'error', message: '新闻不存在' });
      }

      res.json({
        status: 'success',
        data: { news }
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

      // 删除与该新闻相关的所有文件
      const relatedFiles = await File.find({
        $or: [
          { 'source.type': 'news_cover', 'source.newsId': news._id },
          { 'source.type': 'news_content', 'source.newsId': news._id }
        ]
      });

      // 删除文件记录和物理文件
      for (const file of relatedFiles) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        await file.deleteOne();
      }

      // 删除新闻记录
      await news.deleteOne();

      res.json({ status: 'success', message: '新闻删除成功' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }
} 
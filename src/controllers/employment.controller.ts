import { Response } from 'express';
import { AuthRequest } from '../types';
import Employment from '../models/employment.model';
import User from '../models/user.model';
import File from '../models/file.model';
import fs from 'fs';
import { getTextFromMarkdown, getNewsSummary, handleBase64Images } from '../utils/utils';

export class EmploymentController {
  // 创建就业资讯
  static async create(req: AuthRequest, res: Response) {
    try {
      const { title, content, category, tag, status = 'draft', cover, source } = req.body;
      
      // 处理 cover 对象，确保它是有效的
      let coverData = null;
      if (cover && cover._id) {
        coverData = {
          _id: cover._id,
          url: cover.url,
          path: cover.path || '',  // 允许为空
          userId: cover.userId || req.user?.userId,  // 如果没有，使用当前用户ID
          originalName: cover.originalName,
          size: cover.size,
          mimeType: cover.mimeType,
          createdAt: cover.createdAt || new Date()
        };
      }

      const employment = await Employment.create({
        title,
        content,
        source,
        summary: getNewsSummary(getTextFromMarkdown(content)),
        category,
        tag,
        status,
        cover: coverData,
        author: req.user?.userId,
      });

      // 处理内容中的 base64 图片
      const processedContent = await handleBase64Images(content, req.user?.userId || '', {
        newsId: employment._id as string,
        title: title
      });

      // 更新内容
      employment.content = processedContent;
      await employment.save();

      res.status(201).json({
        status: 'success',
        message: '就业资讯创建成功',
        data: employment
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 获取就业资讯列表
  static async getList(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { title, category, tag, status } = req.query;

      const query: any = {};

      if (title) {
        query.title = new RegExp(title as string, 'i');
      }
      if (category) {
        query.category = category;
      }
      if (tag) {
        query.tag = tag;
      }
      if (status) {
        query.status = status;
      }

      const total = await Employment.countDocuments(query);
      const employments = await Employment.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        status: 'success',
        data: {
          employments,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 获取就业资讯详情
  static async getDetail(req: AuthRequest, res: Response) {
    try {
      const employment = await Employment.findById(req.params.id)
        .populate('author', 'username');

      if (!employment) {
        return res.status(404).json({ status: 'error', message: '就业资讯不存在' });
      }

      res.json({
        status: 'success',
        data: {
          employment
        }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 更新就业资讯
  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (updateData.content) {
        const processedContent = await handleBase64Images(updateData.content, req.user?.userId || '', {
          newsId: id,
          title: updateData.title
        });
        updateData.content = processedContent;
        updateData.summary = getNewsSummary(getTextFromMarkdown(updateData.content));
      }

      const employment = await Employment.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('author', 'username').populate('cover');

      if (!employment) {
        return res.status(404).json({ status: 'error', message: '就业资讯不存在' });
      }

      res.json({
        status: 'success',
        data: { employment }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 删除就业资讯
  static async delete(req: AuthRequest, res: Response) {
    try {
      const employment = await Employment.findById(req.params.id);

      if (!employment) {
        return res.status(404).json({ status: 'error', message: '就业资讯不存在' });
      }

      // 权限检查
      if (employment.author.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: '没有权限删除此就业资讯' });
      }

      // 删除相关文件
      const relatedFiles = await File.find({
        $or: [
          { 'source.type': 'employment_cover', 'source.employmentId': employment._id },
          { 'source.type': 'employment_content', 'source.employmentId': employment._id }
        ]
      });

      for (const file of relatedFiles) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        await file.deleteOne();
      }

      await employment.deleteOne();

      res.json({ status: 'success', message: '就业资讯删除成功' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }

  // 获取所有就业资讯(无分页)
  static async getAllEmployments(req: AuthRequest, res: Response) {
    try {
      const { title, category, tag, author, status } = req.query;
      const query: any = {};

      if (title) {
        query.title = new RegExp(title as string, 'i');
      }
      if (category) {
        query.category = category;
      }
      if (tag) {
        query.tag = tag;
      }
      if (author) {
        const user = await User.findOne({ username: new RegExp(author as string, 'i') });
        if (user) {
          query.author = user._id;
        } else {
          return res.json({
            status: 'success',
            data: {
              employments: []
            }
          });
        }
      }
      if (status) {
        query.status = status;
      }

      const employments = await Employment.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: {
          employments
        }
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: '服务器错误', error });
    }
  }
} 
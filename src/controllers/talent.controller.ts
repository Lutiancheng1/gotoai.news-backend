import { Request, Response } from 'express';
import Talent from '../models/talent.model';
import { AuthRequest } from '../types/auth';

export class TalentController {
  // 创建人才推荐
  static async create(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        title,
        summary,
        skills,
        experience,
        education,
        contact,
      } = req.body;

      const avatar = req.file?.path;

      const talent = new Talent({
        name,
        title,
        avatar: avatar || '',
        summary,
        skills,
        experience,
        education,
        contact,
        recommendedBy: req.user?.userId,
      });

      await talent.save();

      res.status(201).json({
        message: '人才信息创建成功',
        talent,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 获取人才列表
  static async getList(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skills = req.query.skills as string;
      const status = req.query.status as string;
      const keyword = req.query.keyword as string;
      const featured = req.query.featured === 'true';

      const query: any = {};

      if (skills) {
        query.skills = { $in: skills.split(',') };
      }

      if (status) {
        query.status = status;
      }

      if (featured) {
        query.featured = true;
      }

      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { title: { $regex: keyword, $options: 'i' } },
          { summary: { $regex: keyword, $options: 'i' } },
        ];
      }

      const total = await Talent.countDocuments(query);
      const talents = await Talent.find(query)
        .populate('recommendedBy', 'username')
        .sort({ featured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        talents,
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

  // 获取人才详情
  static async getDetail(req: Request, res: Response) {
    try {
      const talent = await Talent.findById(req.params.id)
        .populate('recommendedBy', 'username');

      if (!talent) {
        return res.status(404).json({ message: '人才信息不存在' });
      }

      res.json(talent);
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 更新人才信息
  static async update(req: AuthRequest, res: Response) {
    try {
      const {
        name,
        title,
        summary,
        skills,
        experience,
        education,
        contact,
        status,
        featured,
      } = req.body;

      const avatar = req.file?.path;

      const talent = await Talent.findById(req.params.id);

      if (!talent) {
        return res.status(404).json({ message: '人才信息不存在' });
      }

      // 检查权限
      if (talent.recommendedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: '没有权限修改此人才信息' });
      }

      const updateData: any = {
        name,
        title,
        summary,
        skills,
        experience,
        education,
        contact,
        status,
      };

      // 只有管理员可以设置推荐状态
      if (req.user?.role === 'admin') {
        updateData.featured = featured;
      }

      if (avatar) {
        updateData.avatar = avatar;
      }

      const updatedTalent = await Talent.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('recommendedBy', 'username');

      res.json({
        message: '人才信息更新成功',
        talent: updatedTalent,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 删除人才信息
  static async delete(req: AuthRequest, res: Response) {
    try {
      const talent = await Talent.findById(req.params.id);

      if (!talent) {
        return res.status(404).json({ message: '人才信息不存在' });
      }

      // 检查权限
      if (talent.recommendedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: '没有权限删除此人才信息' });
      }

      await Talent.findByIdAndDelete(req.params.id);

      res.json({ message: '人才信息删除成功' });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 设置推荐状态（仅管理员）
  static async setFeatured(req: AuthRequest, res: Response) {
    try {
      const { featured } = req.body;

      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: '只有管理员可以设置推荐状态' });
      }

      const talent = await Talent.findByIdAndUpdate(
        req.params.id,
        { featured },
        { new: true }
      );

      if (!talent) {
        return res.status(404).json({ message: '人才信息不存在' });
      }

      res.json({
        message: '推荐状态更新成功',
        talent,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }
} 
import { Request, Response } from 'express';
import Job from '../models/job.model';
import { AuthRequest } from '../types/auth';

export class JobController {
  // 创建职位
  static async create(req: AuthRequest, res: Response) {
    try {
      const {
        title,
        company,
        location,
        description,
        requirements,
        salary,
        employmentType,
        experienceLevel,
        tags,
      } = req.body;

      const job = new Job({
        title,
        company,
        location,
        description,
        requirements,
        salary,
        employmentType,
        experienceLevel,
        tags,
        postedBy: req.user?.userId,
      });

      await job.save();

      res.status(201).json({
        message: '职位创建成功',
        job,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 获取职位列表
  static async getList(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const location = req.query.location as string;
      const employmentType = req.query.employmentType as string;
      const experienceLevel = req.query.experienceLevel as string;
      const keyword = req.query.keyword as string;
      const minSalary = parseInt(req.query.minSalary as string);

      const query: any = { status: 'active' };

      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }

      if (employmentType) {
        query.employmentType = employmentType;
      }

      if (experienceLevel) {
        query.experienceLevel = experienceLevel;
      }

      if (minSalary) {
        query['salary.min'] = { $gte: minSalary };
      }

      if (keyword) {
        query.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { company: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ];
      }

      const total = await Job.countDocuments(query);
      const jobs = await Job.find(query)
        .populate('postedBy', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        jobs,
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

  // 获取职位详情
  static async getDetail(req: Request, res: Response) {
    try {
      const job = await Job.findById(req.params.id)
        .populate('postedBy', 'username');

      if (!job) {
        return res.status(404).json({ message: '职位不存在' });
      }

      // 更新浏览次数
      job.applicationCount += 1;
      await job.save();

      res.json(job);
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 更新职位
  static async update(req: AuthRequest, res: Response) {
    try {
      const {
        title,
        company,
        location,
        description,
        requirements,
        salary,
        employmentType,
        experienceLevel,
        tags,
        status,
      } = req.body;

      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: '职位不存在' });
      }

      // 检查权限
      if (job.postedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: '没有权限修改此职位' });
      }

      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        {
          title,
          company,
          location,
          description,
          requirements,
          salary,
          employmentType,
          experienceLevel,
          tags,
          status,
        },
        { new: true }
      ).populate('postedBy', 'username');

      res.json({
        message: '职位更新成功',
        job: updatedJob,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 删除职位
  static async delete(req: AuthRequest, res: Response) {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ message: '职位不存在' });
      }

      // 检查权限
      if (job.postedBy.toString() !== req.user?.userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: '没有权限删除此职位' });
      }

      await Job.findByIdAndDelete(req.params.id);

      res.json({ message: '职位删除成功' });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }

  // 职位统计
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await Job.aggregate([
        {
          $group: {
            _id: '$employmentType',
            count: { $sum: 1 },
            avgSalaryMin: { $avg: '$salary.min' },
            avgSalaryMax: { $avg: '$salary.max' },
          },
        },
      ]);

      const locationStats = await Job.aggregate([
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      res.json({
        employmentTypeStats: stats,
        topLocations: locationStats,
      });
    } catch (error) {
      res.status(500).json({ message: '服务器错误', error });
    }
  }
} 
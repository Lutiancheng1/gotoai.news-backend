import { Request, Response } from 'express'
import { AuthRequest } from '../types/auth'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import File from '../models/file.model'
import News from '../models/news.model'
import Talent from '../models/talent.model'
import Employment from '../models/employment.model'
import { v4 as uuidv4 } from 'uuid'
export class UploadController {
  static storage = multer.diskStorage({
    destination: (req: AuthRequest, file: Express.Multer.File, cb) => {
      const userFolder = path.join('uploads', req.user?.userId || 'anonymous')
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true })
      }
      cb(null, userFolder)
    },
    filename: (req, file: Express.Multer.File, cb) => {
      const iconv = require('iconv-lite')
      try {
        const originalName = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf-8')
        const fileId = uuidv4()
        const extension = path.extname(originalName)
        cb(null, `${fileId}${extension}`)
      } catch (error) {
        console.error('文件名解码失败:', error)
        const fileId = uuidv4()
        const extension = path.extname(file.originalname)
        cb(null, `${fileId}${extension}`)
      }
    }
  })

  static async upload(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: '没有文件被上传'
        })
      }
      
      const originalName = decodeURIComponent(req.file.originalname)
      const fileUrl = `${process.env.BASE_URL}/uploads/${req.user?.userId}/${req.file.filename}`
      const fileId = path.parse(req.file.filename).name
      const extension = path.extname(originalName)
      
      const { sourceType, newsId, talentId, employmentId, title } = req.body

      const fileRecord = new File({
        userId: req.user?.userId,
        originalName: originalName,
        size: req.file.size,
        mimeType: req.file.mimetype,
        path: req.file.path,
        url: fileUrl,
        fileId,
        extension,
        source: {
          type: sourceType || 'user_upload',
          newsId: sourceType === 'news_cover' ? newsId : undefined,
          employmentId: sourceType === 'employment_cover' ? employmentId : undefined,
          talentId: sourceType === 'talent_avatar' ? talentId : undefined,
          title
        }
      })

      await fileRecord.save()

      res.json({
        status: 'success',
        message: '文件上传成功',
        data: fileRecord
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: '文件上传失败',
        error
      })
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { fileId } = req.params
      const fileRecord = await File.findOne({ _id: fileId, userId: req.user?.userId })

      if (!fileRecord) {
        return res.status(404).json({ status: 'error', message: '文件不存在' })
      }

      // 查找并更新引用此文件的新闻
      await News.updateMany({ 'cover._id': fileId }, { $set: { cover: null } })

      // 查找并更新引用此文件的人才信息
      await Talent.updateMany({ 'avatar._id': fileId }, { $set: { avatar: null } })

      // 查找并更新引用此文件的就业资讯
      await Employment.updateMany({ 'cover._id': fileId }, { $set: { cover: null } })

      // 删除物理文件
      if (fs.existsSync(fileRecord.path)) {
        fs.unlinkSync(fileRecord.path)
      }

      await fileRecord.deleteOne()

      res.json({ status: 'success', message: '文件删除成功' })
    } catch (error) {
      console.error('删除文件时出错:', error)
      res.status(500).json({ status: 'error', message: '文件删除失败', error })
    }
  }

  static async getUserFiles(req: AuthRequest, res: Response) {
    try {
      const files = await File.find({ userId: req.user?.userId })
        .sort({ createdAt: -1 })
      res.json({
        status: 'success',
        data: files
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: '获取文件列表失败',
        error
      })
    }
  }

  static async saveFile(file: any, userId: string, source: {
    type: 'user_upload' | 'news_cover' | 'talent_avatar' | 'news_content' | 'employment_cover' | 'employment_content';
    newsId?: string;
    employmentId?: string;
    talentId?: string;
    title?: string;
  }) {
    const fileId = uuidv4();
    const extension = path.extname(file.originalname);
    const userFolder = path.join('uploads', userId);
    
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    
    const filename = `${fileId}${extension}`;
    const filePath = path.join(userFolder, filename);
    
    fs.writeFileSync(filePath, file.buffer);
    
    const fileRecord = new File({
      userId,
      originalName: file.originalname,
      size: file.buffer.length,
      mimeType: file.mimetype,
      path: filePath,
      url: `${process.env.BASE_URL}/uploads/${userId}/${filename}`,
      fileId,
      extension,
      source
    });

    await fileRecord.save();
    return fileRecord;
  }
}

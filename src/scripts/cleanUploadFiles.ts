 import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import File from '../models/file.model';
import News from '../models/news.model';
import Talent from '../models/talent.model';
import dotenv from 'dotenv';

dotenv.config();

const cleanFiles = async () => {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('数据库连接成功');

    // 获取所有文件记录
    const files = await File.find({});
    console.log(`找到 ${files.length} 个文件记录`);

    for (const file of files) {
      try {
        // 检查文件是否被引用
        const newsCount = await News.countDocuments({ cover: file._id });
        const talentCount = await Talent.countDocuments({ avatar: file._id });

        if (newsCount > 0 || talentCount > 0) {
          console.log(`文件 ${file.originalName} 正在被使用，跳过删除`);
          continue;
        }

        // 删除物理文件
        const filePath = file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`物理文件已删除: ${filePath}`);
        } else {
          console.log(`物理文件不存在: ${filePath}`);
        }

        // 删除数据库记录
        await file.deleteOne();
        console.log(`数据库记录已删除: ${file.originalName}`);

      } catch (error) {
        console.error(`处理文件 ${file.originalName} 时出错:`, error);
      }
    }

    console.log('清理完成');
    process.exit(0);
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
};

cleanFiles();
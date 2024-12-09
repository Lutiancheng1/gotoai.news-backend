import { UploadController } from '../controllers/upload.controller';
import { logger } from './logger';

// 添加工具函数
export const getTextFromMarkdown = (markdown: string): string => {
  // 移除代码块
  let text = markdown.replace(/```[\s\S]*?```/g, '');
  
  // 移除行内代码
  text = text.replace(/`[^`]*`/g, '');
  
  // 移除链接
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  
  // 移除图片
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');
  
  // 移除 HTML 标签
  text = text.replace(/<[^>]*>/g, '');
  
  // 移除 markdown 标记符号
  text = text.replace(/[#*_~`]/g, '');
  
  // 移除多余空格和换行
  text = text.replace(/\s+/g, ' ').trim();
  
  return text
};

export const getNewsSummary = (text: string) => { 
    // 查找第一个句号的位置
  const firstSentenceMatch = text.match(/[^。]*。/);
  
  if (firstSentenceMatch) {
    // 如果找到句号，返回第一个句子（包括句号）
    return firstSentenceMatch[0].trim();
  } else {
    // 如果没有找到句号，返回前50个字符
    return text.substring(0, 50) + '...';
  }
}

// 添加工具函数处理 base64 图片
export const handleBase64Images = async (
  content: string, 
  userId: string, 
  sourceInfo: { 
    newsId?: string;
    employmentId?: string;
    title: string;
  }
): Promise<string> => {
  const imgRegex = /<img[^>]+src="data:image\/[^"]+[^>]*>/g;
  const matches = content.match(imgRegex);
  
  if (!matches) return content;
  logger.info(`匹配到的 base64 图片数量: ${matches?.length}`);
  
  let newContent = content;
  for (const imgTag of matches) {
    try {
      // 提取 src 属性中的 base64 数据
      const srcMatch = imgTag.match(/src="(data:image\/[^"]+)"/);
      if (!srcMatch) continue;
      
      const pureBase64 = srcMatch[1];
      const base64Data = pureBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = pureBase64.split(';')[0].split(':')[1];
      
      const buffer = Buffer.from(base64Data, 'base64');
      
      // 创建临时文件对象
      const tempFile = {
        buffer,
        originalname: `image_${Date.now()}.${mimeType.split('/')[1]}`,
        mimetype: mimeType
      };

      // 使用上传控制器保存文件，根据来源类型设置不同的参数
      const savedFile = await UploadController.saveFile(tempFile, userId, {
        type: sourceInfo.newsId ? 'news_content' : 'employment_content',
        newsId: sourceInfo.newsId,
        employmentId: sourceInfo.employmentId,
        title: sourceInfo.title
      });
      
      // 只替换 src 属性，保留其他属性
      const newImgTag = imgTag.replace(/src="data:image\/[^"]+"/g, `src="${savedFile.url}"`);
      newContent = newContent.replace(imgTag, newImgTag);
    } catch (error) {
      console.error('处理 base64 图片失败:', error);
    }
  }
  
  return newContent;
};
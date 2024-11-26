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
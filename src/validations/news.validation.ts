import { body } from 'express-validator';

export const createNewsValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('新闻标题不能为空')
    .isLength({ min: 2, max: 100 })
    .withMessage('新闻标题长度应在2-100字符之间'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('新闻内容不能为空')
    .isLength({ min: 10 })
    .withMessage('新闻内容至少需要10个字符'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('新闻分类不能为空')
    .isLength({ max: 50 })
    .withMessage('新闻分类长度不能超过50字符'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('新闻状态必须是 draft 或 published')
];

export const updateNewsValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('新闻标题不能为空')
    .isLength({ min: 2, max: 100 })
    .withMessage('新闻标题长度应在2-100字符之间'),
  
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('新闻内容不能为空')
    .isLength({ min: 10 })
    .withMessage('新闻内容至少需要10个字符'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('新闻分类不能为空')
    .isLength({ max: 50 })
    .withMessage('新闻分类长度不能超过50字符'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('新闻状态必须是 draft 或 published')
]; 
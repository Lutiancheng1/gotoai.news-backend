import { body } from 'express-validator';

export const createEmploymentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ min: 2, max: 100 })
    .withMessage('标题长度应在2-100字符之间'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('内容不能为空')
    .isLength({ min: 10 })
    .withMessage('内容至少需要10个字符'),
  
  body('category')
    .isIn(['employment_news', 'employment_policy'])
    .withMessage('分类必须是就业资讯或就业政策'),
  
  body('tag')
    .isIn(['important', 'job', 'startup', 'national_policy', 'local_policy'])
    .withMessage('标签不正确'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('状态必须是 draft 或 published'),
  
  body('source')
    .notEmpty()
    .withMessage('来源不能为空')
    .isString()
    .withMessage('来源必须是字符串')
    .trim()
    .isLength({ max: 100 })
    .withMessage('来源长度不能超过100个字符')
];

export const updateEmploymentValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ min: 2, max: 100 })
    .withMessage('标题长度应在2-100字符之间'),
  
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('内容不能为空')
    .isLength({ min: 10 })
    .withMessage('内容至少需要10个字符'),
  
  body('category')
    .optional()
    .isIn(['employment_news', 'employment_policy'])
    .withMessage('分类必须是就业资讯或就业政策'),
  
  body('tag')
    .optional()
    .isIn(['important', 'job', 'startup', 'national_policy', 'local_policy'])
    .withMessage('标签不正确'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('状态必须是 draft 或 published'),
  
  body('source')
    .optional()
    .isString()
    .withMessage('来源必须是字符串')
    .trim()
    .isLength({ max: 100 })
    .withMessage('来源长度不能超过100个字符')
]; 
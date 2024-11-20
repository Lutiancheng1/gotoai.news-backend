import { body } from 'express-validator';

export const newsValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('标题长度必须在2-100个字符之间'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('内容不能为空'),
  body('summary')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('摘要长度必须在10-300个字符之间'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('分类不能为空'),
  body('tags')
    .isArray()
    .withMessage('标签必须是数组格式'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('状态值无效'),
]; 
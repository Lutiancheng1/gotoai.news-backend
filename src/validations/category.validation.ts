import { body } from 'express-validator';
export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('分类名称不能为空')
    .isLength({ min: 2, max: 50 })
    .withMessage('分类名称长度应在2-50字符之间'),
  
  body('type')
    .isIn(['news', 'recruitment'])
    .withMessage('分类类型必须是 news 或 recruitment')
]; 
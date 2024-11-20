import { body } from 'express-validator';

export const jobValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('职位标题长度必须在2-100个字符之间'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('公司名称不能为空'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('工作地点不能为空'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('职位描述不能为空'),
  body('requirements')
    .isArray()
    .withMessage('要求必须是数组格式'),
  body('salary')
    .isObject()
    .withMessage('薪资必须是对象格式'),
  body('salary.min')
    .isNumeric()
    .withMessage('最低薪资必须是数字'),
  body('salary.max')
    .isNumeric()
    .withMessage('最高薪资必须是数字'),
  body('employmentType')
    .isIn(['full-time', 'part-time', 'contract', 'internship'])
    .withMessage('无效的工作类型'),
  body('experienceLevel')
    .isIn(['entry', 'intermediate', 'senior', 'expert'])
    .withMessage('无效的经验要求'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组格式'),
]; 
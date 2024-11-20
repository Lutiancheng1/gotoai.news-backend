import { body } from 'express-validator';

export const talentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名长度必须在2-50个字符之间'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('职位不能为空'),
  body('summary')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('简介长度必须在10-500个字符之间'),
  body('skills')
    .isArray()
    .withMessage('技能必须是数组格式'),
  body('experience')
    .isArray()
    .withMessage('工作经验必须是数组格式'),
  body('experience.*.company')
    .trim()
    .notEmpty()
    .withMessage('公司名称不能为空'),
  body('experience.*.position')
    .trim()
    .notEmpty()
    .withMessage('职位不能为空'),
  body('experience.*.duration')
    .trim()
    .notEmpty()
    .withMessage('工作时间不能为空'),
  body('education')
    .isArray()
    .withMessage('教育经历必须是数组格式'),
  body('education.*.school')
    .trim()
    .notEmpty()
    .withMessage('学校名称不能为空'),
  body('education.*.degree')
    .trim()
    .notEmpty()
    .withMessage('学位不能为空'),
  body('contact.email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
];

export const talentUpdateValidation = [
  ...talentValidation,
  body('status')
    .optional()
    .isIn(['available', 'not-available'])
    .withMessage('无效的状态值'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('推荐状态必须是布尔值'),
]; 
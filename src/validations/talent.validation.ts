import { body } from 'express-validator';

export const createTalentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('姓名不能为空')
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名长度应在2-50字符之间'),
  
  body('position')
    .trim()
    .notEmpty()
    .withMessage('职位不能为空')
    .isLength({ min: 2, max: 100 })
    .withMessage('职位长度应在2-100字符之间'),
  
  body('summary')
    .trim()
    .notEmpty()
    .withMessage('个人简介不能为空')
    .isLength({ min: 10, max: 1000 })
    .withMessage('个人简介长度应在10-1000字符之间'),
  
  body('skills')
    .custom((value) => {
      let skillsArray: string[];
      
      if (typeof value === 'string') {
        skillsArray = value.split(',').map(skill => skill.trim()).filter(Boolean);
      } else if (Array.isArray(value)) {
        skillsArray = value;
      } else {
        throw new Error('技能必须是数组或逗号分隔的字符串');
      }

      if (!skillsArray.length) {
        throw new Error('至少需要一个技能');
      }

      return true;
    }),
  
  body('skills.*')
    .trim()
    .notEmpty()
    .withMessage('技能不能为空')
    .isLength({ max: 50 })
    .withMessage('单个技能长度不能超过50字符'),
  
  body('workExperience')
    .trim()
    .notEmpty()
    .withMessage('工作经验不能为空')
    .isLength({ max: 2000 })
    .withMessage('工作经验长度不能超过2000字符'),
  
  body('education')
    .trim()
    .notEmpty()
    .withMessage('教育经历不能为空')
    .isLength({ max: 1000 })
    .withMessage('教育经历长度不能超过1000字符'),
  
  body('contact')
    .trim()
    .notEmpty()
    .withMessage('联系方式不能为空')
    .isLength({ max: 500 })
    .withMessage('联系方式长度不能超过500字符'),
  
  body('status')
    .optional()
    .isIn(['available', 'unavailable'])
    .withMessage('状态必须是 available 或 unavailable'),
];

export const updateTalentValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('姓名不能为空')
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名长度应在2-50字符之间'),
  
  body('position')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('职位不能为空')
    .isLength({ min: 2, max: 100 })
    .withMessage('职位长度应在2-100字符之间'),
  
  body('summary')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('个人简介不能为空')
    .isLength({ min: 10, max: 1000 })
    .withMessage('个人简介长度应在10-1000字符之间'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('技能必须是数组格式')
    .notEmpty()
    .withMessage('至少需要一个技能'),
  
  body('skills.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('技能不能为空')
    .isLength({ max: 50 })
    .withMessage('单个技能长度不能超过50字符'),
  
  body('workExperience')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('工作经验不能为空')
    .isLength({ max: 2000 })
    .withMessage('工作经验长度不能超过2000字符'),
  
  body('education')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('教育经历不能为空')
    .isLength({ max: 1000 })
    .withMessage('教育经历长度不能超过1000字符'),
  
  body('contact')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('联系方式不能为空')
    .isLength({ max: 500 })
    .withMessage('联系方式长度不能超过500字符'),
  
  body('status')
    .optional()
    .isIn(['available', 'not-available'])
    .withMessage('状态必须是 available 或 not-available'),
];
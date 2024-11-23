import { body } from 'express-validator';

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度不能少于6个字符'),
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .exists()
    .withMessage('请输入密码'),
];

export const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址'),
  
  body('currentPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('当前密码长度不能少于6个字符'),
  
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('新密码长度不能少于6个字符')
    .custom((value, { req }) => {
      // 如果提供了当前密码，则新密码必填
      if (req.body.currentPassword && !value) {
        throw new Error('请输入新密码');
      }
      // 如果提供了新密码，则当前密码必填
      if (value && !req.body.currentPassword) {
        throw new Error('请输入当前密码');
      }
      return true;
    }),
]; 
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
]; 
import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerValidation, loginValidation, updateProfileValidation } from '../validations/auth.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用户认证和授权相关接口
 */

const handleLogin: RequestHandler = async (req, res, next) => {
  try {
    await AuthController.login(req, res);
  } catch (error) {
    next(error);
  }
};

const handleGetCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    await AuthController.getCurrentUser(req, res);
  } catch (error) {
    next(error);
  }
};

const handleGetDevCredentials: RequestHandler = async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.json({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
  } else {
    res.status(404).json({ message: 'Not available in production' });
  }
};
 
const handleUpdateProfile: RequestHandler = async (req, res, next) => {
  try {
    await AuthController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 登录失败
 *       429:
 *         description: 登录尝试次数过多
 */
router.post('/login', validate(loginValidation), handleLogin);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', auth, handleGetCurrentUser);

// 开发环境接口
if (process.env.NODE_ENV === 'development') {
  /**
   * @swagger
   * /auth/dev-credentials:
   *   get:
   *     summary: 获取开发环境默认账号（仅开发环境可用）
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: 成功获取开发环境账号
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 email:
   *                   type: string
   *                 password:
   *                   type: string
   *       404:
   *         description: 生产环境不可用
   */
  router.get('/dev-credentials', handleGetDevCredentials);
}

router.put('/update-profile', auth, validate(updateProfileValidation), handleUpdateProfile);

export default router; 
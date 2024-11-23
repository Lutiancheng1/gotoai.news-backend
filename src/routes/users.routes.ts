import { Router, RequestHandler } from 'express';
import { UsersController } from '../controllers/users.controller';
import { auth, canModifyUser, superAdminOnly, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// 处理函数包装器
const handleGetUsers: RequestHandler = async (req, res, next) => {
  try {
    await UsersController.getUsers(req, res, next);
  } catch (error) {
    next(error);
  }
};

const handleGetUser: RequestHandler = async (req, res, next) => {
  try {
    await UsersController.getUser(req, res, next);
  } catch (error) {
    next(error);
  }
};

const handleUpdateUser: RequestHandler = async (req, res, next) => {
  try {
    await UsersController.updateUser(req, res, next);
  } catch (error) {
    next(error);
  }
};

const handleDeleteUser: RequestHandler = async (req, res, next) => {
  try {
    await UsersController.deleteUser(req, res, next);
  } catch (error) {
    next(error);
  }
};

// 添加新的路由处理器
const handleCreateUser: RequestHandler = async (req, res, next) => {
  try {
    await UsersController.createUser(req, res, next);
  } catch (error) {
    next(error);
  }
};

const handleToggleStatus: RequestHandler = async (req, res, next) => {
  try {
    await UsersController.toggleUserStatus(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 获取所有用户列表
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     total:
 *                       type: number
 */
router.get('/', auth, handleGetUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 获取单个用户信息
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *       404:
 *         description: 用户不存在
 */
router.get('/:id', auth, adminOnly, handleGetUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: 更新用户信息
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: 更新成功
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 */
router.put('/:id', auth, canModifyUser, handleUpdateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 删除用户
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 */
router.delete('/:id', auth, superAdminOnly, handleDeleteUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 创建用户
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 用户名或邮箱已存在
 */
router.post('/', auth, adminOnly, handleCreateUser);

/**
 * @swagger
 * /users/{id}/toggle-status:
 *   patch:
 *     summary: 切换用户状态
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 切换成功
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 */
router.patch('/:id/toggle-status', auth, adminOnly, handleToggleStatus);

export default router; 
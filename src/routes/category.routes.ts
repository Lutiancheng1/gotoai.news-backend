import { Router, RequestHandler } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { auth } from '../middlewares/auth.middleware';
import { canModifyCategory } from '../middlewares/auth.middleware';

const router = Router();

// 处理函数包装器
const handleGetCategories: RequestHandler = async (req, res, next) => {
  try {
    await CategoryController.getList(req, res);
  } catch (error) {
    next(error);
  }
};

const handleGetAllCategories: RequestHandler = async (req, res, next) => {
  try {
    await CategoryController.getAll(req, res);
  } catch (error) {
    next(error);
  }
};

const handleCreateCategory: RequestHandler = async (req, res, next) => {
  try {
    await CategoryController.create(req, res);
  } catch (error) {
    next(error);
  }
};

const handleUpdateCategory: RequestHandler = async (req, res, next) => {
  try {
    await CategoryController.update(req, res);
  } catch (error) {
    next(error);
  }
};

const handleDeleteCategory: RequestHandler = async (req, res, next) => {
  try {
    await CategoryController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: 新闻分类管理相关接口
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: 获取分类列表（分页）
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 成功获取分类列表
 */
router.get('/', auth, handleGetCategories);

/**
 * @swagger
 * /categories/all:
 *   get:
 *     summary: 获取所有分类（不分页）
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: 成功获取所有分类
 */
router.get('/all', handleGetAllCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: 创建分类
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 分类名称已存在
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 */
router.post('/', auth, handleCreateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: 更新分类
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 分类名称已存在
 *       404:
 *         description: 分类不存在
 */
router.put('/:id', auth, canModifyCategory, handleUpdateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: 删除分类
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 分类不存在
 */
router.delete('/:id', auth, canModifyCategory, handleDeleteCategory);

export default router; 
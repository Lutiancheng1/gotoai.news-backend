import { Router, RequestHandler } from 'express';
import { NewsController } from '../controllers/news.controller';
import { auth, adminOnly, canModifyNews } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createNewsValidation, updateNewsValidation } from '../validations/news.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: News
 *   description: 新闻管理相关接口
 */

// 处理函数包装器
const handleGetNews: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.getList(req, res);
  } catch (error) {
    next(error);
  }
};

const handleGetNewsDetail: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.getDetail(req, res);
  } catch (error) {
    next(error);
  }
};

const handleCreateNews: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.create(req, res);
  } catch (error) {
    next(error);
  }
};

const handleUpdateNews: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.update(req, res);
  } catch (error) {
    next(error);
  }
};

const handleDeleteNews: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /news:
 *   get:
 *     summary: 获取新闻列表
 *     tags: [News]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: 新闻分类
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: 新闻状态
 *     responses:
 *       200:
 *         description: 成功获取新闻列表
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
 *                     news:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/News'
 *                     total:
 *                       type: number
 */
router.get('/', handleGetNews);

/**
 * @swagger
 * /news/{id}:
 *   get:
 *     summary: 获取新闻详情
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 新闻ID
 *     responses:
 *       200:
 *         description: 成功获取新闻详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', handleGetNewsDetail);

/**
 * @swagger
 * /news:
 *   post:
 *     summary: 创建新闻
 *     tags: [News]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: 新闻标题
 *               content:
 *                 type: string
 *                 description: 新闻内容
 *               category:
 *                 type: string
 *                 description: 新闻分类
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *                 description: 新闻状态
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', auth, validate(createNewsValidation), handleCreateNews);

/**
 * @swagger
 * /news/{id}:
 *   put:
 *     summary: 更新新闻
 *     tags: [News]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 新闻ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/News'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', auth, canModifyNews, validate(updateNewsValidation), handleUpdateNews);

/**
 * @swagger
 * /news/{id}:
 *   delete:
 *     summary: 删除新闻
 *     tags: [News]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 新闻ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 新闻删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', auth, adminOnly, handleDeleteNews);

export default router; 
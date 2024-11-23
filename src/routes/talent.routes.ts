import { Router, RequestHandler } from 'express';
import { TalentsController } from '../controllers/talent.controller';
import { auth, adminOnly, canModifyTalent } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTalentValidation, updateTalentValidation } from '../validations/talent.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Talents
 *   description: 人才管理相关接口
 */

// 处理函数包装器
const handleGetTalents: RequestHandler = async (req, res, next) => {
  try {
    await TalentsController.getList(req, res);
  } catch (error) {
    next(error);
  }
};

const handleGetTalent: RequestHandler = async (req, res, next) => {
  try {
    await TalentsController.getDetail(req, res);
  } catch (error) {
    next(error);
  }
};

const handleCreateTalent: RequestHandler = async (req, res, next) => {
  try {
    await TalentsController.create(req, res);
  } catch (error) {
    next(error);
  }
};

const handleUpdateTalent: RequestHandler = async (req, res, next) => {
  try {
    await TalentsController.update(req, res);
  } catch (error) {
    next(error);
  }
};

const handleDeleteTalent: RequestHandler = async (req, res, next) => {
  try {
    await TalentsController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

const handleToggleFeatured: RequestHandler = async (req, res, next) => {
  try {
    await TalentsController.toggleFeatured(req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /talents:
 *   get:
 *     summary: 获取人才列表
 *     tags: [Talents]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, not-available]
 *         description: 人才状态
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: 是否推荐
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: 技能标签（逗号分隔）
 *     responses:
 *       200:
 *         description: 成功获取人才列表
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
 *                     talents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Talent'
 *                     total:
 *                       type: number
 */
router.get('/', handleGetTalents);

/**
 * @swagger
 * /talents/{id}:
 *   get:
 *     summary: 获取人才详情
 *     tags: [Talents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 人才ID
 *     responses:
 *       200:
 *         description: 成功获取人才详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Talent'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', handleGetTalent);

/**
 * @swagger
 * /talents:
 *   post:
 *     summary: 创建人才信息
 *     tags: [Talents]
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
 *               - title
 *               - skills
 *             properties:
 *               name:
 *                 type: string
 *                 description: 姓名
 *               title:
 *                 type: string
 *                 description: 职位
 *               avatar:
 *                 type: string
 *                 description: 头像URL
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 技能列表
 *               status:
 *                 type: string
 *                 enum: [available, not-available]
 *                 default: available
 *                 description: 状态
 *               featured:
 *                 type: boolean
 *                 default: false
 *                 description: 是否推荐
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
 *                   $ref: '#/components/schemas/Talent'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', auth, validate(createTalentValidation), handleCreateTalent);

/**
 * @swagger
 * /talents/{id}:
 *   put:
 *     summary: 更新人才信息
 *     tags: [Talents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 人才ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               title:
 *                 type: string
 *               avatar:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [available, not-available]
 *               featured:
 *                 type: boolean
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
 *                   $ref: '#/components/schemas/Talent'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', auth,canModifyTalent, validate(updateTalentValidation), handleUpdateTalent);

/**
 * @swagger
 * /talents/{id}:
 *   delete:
 *     summary: 删除人才信息
 *     tags: [Talents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 人才ID
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
 *                   example: 人才信息删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', auth, canModifyTalent, handleDeleteTalent);

/**
 * @swagger
 * /talents/{id}/featured:
 *   patch:
 *     summary: 切换人才推荐状态
 *     tags: [Talents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 人才ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featured
 *             properties:
 *               featured:
 *                 type: boolean
 *                 description: 是否推荐
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
 *                   $ref: '#/components/schemas/Talent'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/featured', auth, canModifyTalent, handleToggleFeatured);

export default router; 
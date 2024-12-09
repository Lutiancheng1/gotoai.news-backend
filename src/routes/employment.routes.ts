import { Router, RequestHandler } from 'express';
import { EmploymentController } from '../controllers/employment.controller';
import { auth, canModifyEmployment } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createEmploymentValidation, updateEmploymentValidation } from '../validations/employment.validation';

const router = Router();

// 处理函数包装器
const handleGetEmployments: RequestHandler = async (req, res, next) => {
  try {
    await EmploymentController.getList(req, res);
  } catch (error) {
    next(error);
  }
};

const handleGetEmploymentDetail: RequestHandler = async (req, res, next) => {
  try {
    await EmploymentController.getDetail(req, res);
  } catch (error) {
    next(error);
  }
};

const handleCreateEmployment: RequestHandler = async (req, res, next) => {
  try {
    await EmploymentController.create(req, res);
  } catch (error) {
    next(error);
  }
};

const handleUpdateEmployment: RequestHandler = async (req, res, next) => {
  try {
    await EmploymentController.update(req, res);
  } catch (error) {
    next(error);
  }
};

const handleDeleteEmployment: RequestHandler = async (req, res, next) => {
  try {
    await EmploymentController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

const handleGetAllEmployments: RequestHandler = async (req, res, next) => {
  try {
    await EmploymentController.getAllEmployments(req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * tags:
 *   name: Employment
 *   description: 就业资讯管理相关接口
 */

/**
 * @swagger
 * /employment/all:
 *   get:
 *     summary: 获取所有就业资讯(无分页)
 *     tags: [Employment]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: 标题关键词
 */
router.get('/all', handleGetAllEmployments);

/**
 * @swagger
 * /employment:
 *   get:
 *     summary: 获取就业资讯列表(分页)
 *     tags: [Employment]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: 每页数量
 */
router.get('/', handleGetEmployments);

/**
 * @swagger
 * /employment/{id}:
 *   get:
 *     summary: 获取就业资讯详情
 *     tags: [Employment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 就业资讯ID
 */
router.get('/:id', handleGetEmploymentDetail);

/**
 * @swagger
 * /employment:
 *   post:
 *     summary: 创建就业资讯
 *     tags: [Employment]
 *     security:
 *       - BearerAuth: []
 */
router.post('/', auth, validate(createEmploymentValidation), handleCreateEmployment);

/**
 * @swagger
 * /employment/{id}:
 *   put:
 *     summary: 更新就业资讯
 *     tags: [Employment]
 *     security:
 *       - BearerAuth: []
 */
router.put('/:id', auth, canModifyEmployment, validate(updateEmploymentValidation), handleUpdateEmployment);

/**
 * @swagger
 * /employment/{id}:
 *   delete:
 *     summary: 删除就业资讯
 *     tags: [Employment]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', auth, canModifyEmployment, handleDeleteEmployment);

export default router; 
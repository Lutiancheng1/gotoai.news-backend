import { Router, RequestHandler } from 'express';
import { JobController } from '../controllers/job.controller';
import { auth, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { jobValidation } from '../validations/job.validation';

const router = Router();

// 获取职位列表
const handleGetList: RequestHandler = async (req, res, next) => {
  try {
    await JobController.getList(req, res);
  } catch (error) {
    next(error);
  }
};

// 获取职位统计
const handleGetStats: RequestHandler = async (req, res, next) => {
  try {
    await JobController.getStats(req, res);
  } catch (error) {
    next(error);
  }
};

// 获取职位详情
const handleGetDetail: RequestHandler = async (req, res, next) => {
  try {
    await JobController.getDetail(req, res);
  } catch (error) {
    next(error);
  }
};

// 创建职位
const handleCreate: RequestHandler = async (req, res, next) => {
  try {
    await JobController.create(req, res);
  } catch (error) {
    next(error);
  }
};

// 更新职位
const handleUpdate: RequestHandler = async (req, res, next) => {
  try {
    await JobController.update(req, res);
  } catch (error) {
    next(error);
  }
};

// 删除职位
const handleDelete: RequestHandler = async (req, res, next) => {
  try {
    await JobController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

router.get('/', handleGetList);
router.get('/stats', handleGetStats);
router.get('/:id', handleGetDetail);
router.post('/', auth, validate(jobValidation), handleCreate);
router.put('/:id', auth, validate(jobValidation), handleUpdate);
router.delete('/:id', auth, handleDelete);

export default router; 
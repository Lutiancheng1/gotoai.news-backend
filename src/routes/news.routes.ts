import { Router, RequestHandler } from 'express';
import { NewsController } from '../controllers/news.controller';
import { auth, adminOnly } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { newsValidation } from '../validations/news.validation';

const router = Router();

// 获取新闻列表
const handleGetList: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.getList(req, res);
  } catch (error) {
    next(error);
  }
};

// 获取新闻详情
const handleGetDetail: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.getDetail(req, res);
  } catch (error) {
    next(error);
  }
};

// 创建新闻
const handleCreate: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.create(req, res);
  } catch (error) {
    next(error);
  }
};

// 更新新闻
const handleUpdate: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.update(req, res);
  } catch (error) {
    next(error);
  }
};

// 删除新闻
const handleDelete: RequestHandler = async (req, res, next) => {
  try {
    await NewsController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

router.get('/', handleGetList);
router.get('/:id', handleGetDetail);
router.post('/', auth, upload.single('cover'), validate(newsValidation), handleCreate);
router.put('/:id', auth, upload.single('cover'), validate(newsValidation), handleUpdate);
router.delete('/:id', auth, handleDelete);

export default router; 
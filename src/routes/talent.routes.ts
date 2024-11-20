import { Router, RequestHandler } from 'express';
import { TalentController } from '../controllers/talent.controller';
import { auth, adminOnly } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { talentValidation, talentUpdateValidation } from '../validations/talent.validation';

const router = Router();

// 获取人才列表
const handleGetList: RequestHandler = async (req, res, next) => {
  try {
    await TalentController.getList(req, res);
  } catch (error) {
    next(error);
  }
};

// 获取人才详情
const handleGetDetail: RequestHandler = async (req, res, next) => {
  try {
    await TalentController.getDetail(req, res);
  } catch (error) {
    next(error);
  }
};

// 创建人才信息
const handleCreate: RequestHandler = async (req, res, next) => {
  try {
    await TalentController.create(req, res);
  } catch (error) {
    next(error);
  }
};

// 更新人才信息
const handleUpdate: RequestHandler = async (req, res, next) => {
  try {
    await TalentController.update(req, res);
  } catch (error) {
    next(error);
  }
};

// 删除人才信息
const handleDelete: RequestHandler = async (req, res, next) => {
  try {
    await TalentController.delete(req, res);
  } catch (error) {
    next(error);
  }
};

// 设置推荐状态
const handleSetFeatured: RequestHandler = async (req, res, next) => {
  try {
    await TalentController.setFeatured(req, res);
  } catch (error) {
    next(error);
  }
};

router.get('/', handleGetList);
router.get('/:id', handleGetDetail);
router.post('/', auth, upload.single('avatar'), validate(talentValidation), handleCreate);
router.put('/:id', auth, upload.single('avatar'), validate(talentUpdateValidation), handleUpdate);
router.delete('/:id', auth, handleDelete);
router.patch('/:id/featured', auth, adminOnly, handleSetFeatured);

export default router; 
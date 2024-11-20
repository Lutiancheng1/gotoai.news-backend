import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerValidation, loginValidation, updateProfileValidation } from '../validations/auth.validation';

const router = Router();

// 用户注册
const handleRegister: RequestHandler = async (req, res, next) => {
  try {
    await AuthController.register(req, res);
  } catch (error) {
    next(error);
  }
};

// 用户登录
const handleLogin: RequestHandler = async (req, res, next) => {
  try {
    await AuthController.login(req, res);
  } catch (error) {
    next(error);
  }
};

// 获取当前用户信息
const handleGetCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    await AuthController.getCurrentUser(req, res);
  } catch (error) {
    next(error);
  }
};

// 更新用户信息
const handleUpdateProfile: RequestHandler = async (req, res, next) => {
  try {
    await AuthController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
};

router.post('/register', validate(registerValidation), handleRegister);
router.post('/login', validate(loginValidation), handleLogin);
router.get('/me', auth, handleGetCurrentUser);
router.put('/profile', auth, validate(updateProfileValidation), handleUpdateProfile);

export default router; 
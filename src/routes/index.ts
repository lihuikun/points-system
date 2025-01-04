import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { CheckInController } from '../controllers/checkin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = Router();

// 认证相关路由
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// 用户相关路由
router.get('/user/info', authMiddleware, UserController.getUserInfo);
router.put('/user/info', authMiddleware, UserController.updateUserInfo);
router.get('/points/history', authMiddleware, UserController.getPointsHistory);

// 签到相关路由
router.post('/checkin', authMiddleware, CheckInController.checkIn);

export default router;
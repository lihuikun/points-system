import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/info', authMiddleware, UserController.getUserInfo);
router.get('/points/history', authMiddleware, UserController.getPointsHistory);
router.put('/info', authMiddleware, UserController.updateUserInfo);

export default router; 
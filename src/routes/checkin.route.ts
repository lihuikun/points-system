import { Router } from 'express';
import { CheckInController } from '../controllers/checkin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, CheckInController.checkIn);

export default router; 
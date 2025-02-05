import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { CheckInController } from '../controllers/checkin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { LotteryController } from '../controllers/lottery.controller';
import { WeatherController } from '../controllers/weather.controller';
import { PostController } from '../controllers/post.controller';
import { GiteeController } from '../controllers/gitee.controller';

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
router.post('/share', CheckInController.share);
router.post('/addPoints', CheckInController.addPoints);

//抽奖接口
router.post('/user/draw', LotteryController.drawLottery);  // 用户抽奖
router.get('/user/draw/history', LotteryController.getDrawHistory);  // 获取抽奖历史

// 天气接口
router.get('/weather', WeatherController.getDailyWeather);  // 获取天气信息

// 朋友圈
router.get('/posts', PostController.getPosts);  // 获取朋友列表
router.post('/posts', PostController.createPost);  // 添加朋友
router.get('/posts/delete', PostController.deletePost);  // 删除朋友

// gitee上传图片
router.post('/gitee/upload', GiteeController.uploadImage);
router.get('/getHello', GiteeController.getHello);

export default router;
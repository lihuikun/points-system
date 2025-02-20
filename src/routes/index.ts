import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { CheckInController } from '../controllers/checkin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { LotteryController } from '../controllers/lottery.controller';
import { WeatherController } from '../controllers/weather.controller';
import { PostController } from '../controllers/post.controller';
import { GiteeController } from '../controllers/gitee.controller';
import { TicketsController } from '../controllers/tickets.controller';
import { GiftController } from '../controllers/gift.controller';

const router = Router();

// 认证相关路由
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// 用户相关路由
router.get('/user/info', authMiddleware, UserController.getUserInfo);
router.put('/user/info', authMiddleware, UserController.updateUserInfo);
router.get('/points/history', authMiddleware, UserController.getPointsHistory);
router.put('/user/password', authMiddleware, UserController.updatePassword);

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
router.post('/posts/comment', PostController.addComment);  // 添加评论
router.post('/posts/like', PostController.likePost);  // 点赞朋友


// gitee上传图片
router.post('/gitee/upload', GiteeController.uploadImage);

// 彩票接口
router.get('/lottery/tickets', TicketsController.getTickets);  // 获取彩票信息
router.post('/lottery/exchange', TicketsController.exchangeTicket);  // 兑换彩票
router.post('/lottery/regenerate', TicketsController.regenerateTickets);  // 重新生成彩票

// 礼品管理
router.get('/gifts', GiftController.getAllGifts);  // 获取礼品列表
router.post('/gifts', GiftController.createGift);  // 添加礼品
router.delete('/gifts/:id', GiftController.deleteGift);  // 删除礼品
router.put('/gifts/:id', GiftController.updateGift);  // 更新礼品
router.post('/gifts/redeem/:id', GiftController.redeemGift);  // 根据id获取礼品
router.get('/gifts/redeem/records/:userId', GiftController.getRedemptionRecords);  // 获取礼品兑换记录

export default router;
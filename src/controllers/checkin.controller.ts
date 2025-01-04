import { RequestHandler } from 'express';
import { CheckIn } from '../models/checkin.model';
import { User } from '../models/user.model';
import { ResponseHandler } from '../utils/response';

export class CheckInController {
  /**
   * @swagger
   * /api/checkin:
   *   post:
   *     tags: [签到]
   *     summary: 用户签到
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 签到成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               code: 200
   *               msg: "签到成功"
   *               data:
   *                 points: 100
   *                 continuousDays: 1
   *                 totalPoints: 200
   */
  static checkIn: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log('开始签到:', { userId, today });

      // 检查今天是否已经签到
      const existingCheckIn = await CheckIn.findOne({
        where: {
          userId,
          checkInDate: today
        }
      });

      if (existingCheckIn) {
        console.log('今日已签到');
        res.json(ResponseHandler.error('今天已经签到过了'));
        return;
      }

      // 获取昨天的签到记录
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastCheckIn = await CheckIn.findOne({
        where: {
          userId,
          checkInDate: yesterday
        }
      });

      let continuousDays = 1;
      let points = 100; // 基础积分

      if (lastCheckIn) {
        continuousDays = lastCheckIn.continuousDays + 1;
        
        // 计算额外奖励
        if (continuousDays === 3) {
          points = 400;
        } else if (continuousDays === 7) {
          points = 800;
        } else if (continuousDays === 15) {
          points = 1000;
          continuousDays = 0; // 重置连续天数
        }
      }

      console.log('签到信息:', { continuousDays, points });

      try {
        // 创建签到记录
        await CheckIn.create({
          userId,
          checkInDate: today,
          continuousDays,
          points
        });

        // 更新用户积分
        await User.increment('points', {
          by: points,
          where: { id: userId }
        });

        const updatedUser = await User.findByPk(userId);
        console.log('签到成功:', { totalPoints: updatedUser?.points });

        res.json(ResponseHandler.success({
          points,
          continuousDays,
          totalPoints: updatedUser?.points
        }, '签到成功'));
      } catch (error) {
        console.error('签到数据库操作失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('签到失败:', error);
      res.json(ResponseHandler.error('签到失败'));
    }
  };
} 
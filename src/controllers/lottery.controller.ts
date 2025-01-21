import { RequestHandler } from 'express';
import { User } from '../models/user.model';
import { Draw } from '../models/draw.model';
import { ResponseHandler } from '../utils/response';
import { sendMail } from '../services/email'

export class LotteryController {
  /**
   * @swagger
   * /api/user/draw:
   *   post:
   *     tags: [抽奖]
   *     summary: 用户抽奖
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       description: 用户抽奖历史
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *                 description: 用户ID
   *     responses:
   *       200:
   *         description: 抽奖成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static drawLottery: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).body.userId;
      const user = await User.findByPk(userId);
      console.log("🚀 ~ LotteryController ~ drawLottery:RequestHandler= ~ user:", user)

      // 判断积分是否足够
      if (!user || user.points < 200) {
        res.json(ResponseHandler.error('积分不足，无法抽奖'));
        return;
      }

      // 扣除200积分
      await User.update({ points: user.points - 200 }, { where: { id: userId } });

      // 根据概率抽取奖项
      const lotteryResult = this.getLotteryResult();

      // 记录抽奖结果
      await Draw.create({
        userId,
        awardName: lotteryResult.name,
        awardValue: lotteryResult.value,
      });

      if (lotteryResult.value) {
        // 把积分追加到用户的积分中
        await User.update({ points: user.points + lotteryResult.value }, { where: { id: userId } });
      }
      // 发送邮件通知
      const emailContent = `
        用户抽奖结果如下：
        用户邮箱: ${user.email}
        用户昵称: ${user.nickname}
        奖项名称: ${lotteryResult.name}
        奖项积分: ${lotteryResult.value || '无'}
        当前积分: ${user.points + (lotteryResult.value || 0)}
      `;
      if(!lotteryResult.value){
        await sendMail('lihk180542@gmail.com', '抽奖结果通知', emailContent);
      }
      res.json(ResponseHandler.success({ ...lotteryResult, points: user.points }));
    } catch (error) {
      console.error('抽奖失败:', error);
      res.json(ResponseHandler.error('抽奖失败'));
    }
  };

  // 根据概率生成抽奖结果
  private static getLotteryResult() {
    const random = Math.random() * 100;
    console.log("🚀 ~ LotteryController ~ getLotteryResult ~ random:", random)

    if (random < 0.01) {
      return { name: '一等奖', value: 0 };
    } else if (random < 0.02) {
      return { name: '二等奖', value: 0 };
    } else if (random < 0.04) {
      return { name: '三等奖', value: 0 };
    } else if (random < 0.05) {
      return { name: '四等奖', value: 0 };
    } else if (random < 0.5) {
      return { name: '五等奖', value: 0 };
    } else if (random < 2) {
      return { name: '六等奖', value: 0 };
    } else if (random < 5) {
      return { name: '七等奖', value: 0 };
    } else {
      return { name: '八等奖', value: Math.floor(Math.random() * 200) + 1 };
    }
  }

  /**
   * @swagger
   * /api/user/draw/history:
   *   get:
   *     tags: [抽奖]
   *     summary: 获取用户抽奖历史
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         description: 页码
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: userId
   *         description: 用户ID
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: pageSize
   *         description: 每页数量
   *         required: true
   *         schema:
   *          type: integer
   *     responses:
   *       200:
   *         description: 获取历史记录成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getDrawHistory: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).query.userId;
      const page = parseInt(req.query.page as string) || 1;  // 页码，默认是第一页
      const pageSize = parseInt(req.query.pageSize as string) || 10;  // 每页显示的记录数，默认10

      const offset = (page - 1) * pageSize;  // 计算查询偏移量

      const history = await Draw.findAll({
        where: { userId },
        order: [['drawDate', 'DESC']],
        limit: pageSize,  // 限制返回记录数
        offset,  // 根据偏移量查询
        attributes: ['id', 'drawDate', 'awardName', 'awardValue'],  // 只返回必要字段
      });

      console.log("🚀 ~ LotteryController ~ getDrawHistory:RequestHandler= ~ history:", history)

      const formattedHistory = history.map(item => ({
        id: item.id,
        drawDate: item.drawDate,
        awardName: item.awardName,
        awardValue: item.awardValue,
      }));

      res.json(ResponseHandler.success(formattedHistory));
    } catch (error) {
      console.error('获取抽奖历史失败:', error);
      res.json(ResponseHandler.error('获取抽奖历史失败'));
    }
  };
}

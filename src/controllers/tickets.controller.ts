import { RequestHandler } from 'express';
import { LotteryService } from '../services/tickets.service';
import { ResponseHandler } from '../utils/response';

export class TicketsController {
  private static lotteryService = new LotteryService();

  /**
   * @swagger
   * /api/lottery/tickets:
   *   get:
   *     tags: [Lottery]
   *     summary: 获取当前的彩票列表（20 张）
   *     responses:
   *       200:
   *         description: 成功返回彩票列表
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getTickets: RequestHandler = async (req, res) => {
    try {
      const tickets =await TicketsController.lotteryService.getTickets();
      console.log("🚀 ~ TicketsController ~ getTickets:RequestHandler= ~ tickets:", tickets)
      res.json(ResponseHandler.success(tickets));
      return;
    } catch (error) {
      res.json(ResponseHandler.error('获取彩票列表失败'));
      return;
    }
  };

  /**
   * @swagger
   * /api/lottery/exchange:
   *   post:
   *     tags: [Lottery]
   *     summary: 用户积分兑换彩票（刮刮乐）接口
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: number
   *                 example: 1
   *               ticketId:
   *                 type: number
   *                 example: 1
   *               userAvatar:
   *                 type: string
   *                 example: "http://example.com/avatar.jpg"
   *               userName:
   *                 type: string
   *                 example: "张三"
   *     responses:
   *       200:
   *         description: 兑换成功，返回刮开的彩票信息及更新后的用户积分
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static exchangeTicket: RequestHandler = async (req, res) => {
    try {
      const { userId, userAvatar, userName,ticketId } = req.body;
      // lotteryService.exchangeTicketWithPoints 内部完成积分扣除、彩票兑换及中奖积分追加操作
      const { ticket, updatedPoints } = await TicketsController.lotteryService.exchangeTicketWithPoints(userId, userAvatar, userName, ticketId);
      res.json(ResponseHandler.success({ ticket, updatedPoints }, '兑换成功'));
      return;
    } catch (error: any) {
      res.json(ResponseHandler.error(error.message || '兑换彩票失败'));
      return;
    }
  };

  /**
   * @swagger
   * /api/lottery/regenerate:
   *   post:
   *     tags: [Lottery]
   *     summary: 重新生成新的彩票集
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 成功生成新的彩票集
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static regenerateTickets: RequestHandler = async (req, res) => {
    try {
      TicketsController.lotteryService.generateNewBook();
      res.json(ResponseHandler.success(null, '新的彩票集已生成'));
      return;
    } catch (error) {
      res.json(ResponseHandler.error('生成新的彩票集失败'));
      return;
    }
  };
}

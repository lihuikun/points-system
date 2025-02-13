import { RequestHandler } from 'express';
import { Gift } from '../models/gift.model';
import { Redemption } from '../models/redemption.model'
import { ResponseHandler } from '../utils/response';
import { User } from '../models/user.model';
import { sendMail } from '../services/email'
export class GiftController {
  /**
   * @swagger
   * /api/gifts:
   *   get:
   *     tags: [礼品]
   *     summary: 获取所有礼品
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getAllGifts: RequestHandler = async (req, res) => {
    try {
      const gifts = await Gift.findAll();
      res.json(ResponseHandler.success(gifts));
    } catch (error) {
      res.json(ResponseHandler.error('获取礼品列表失败'));
    }
  };

  /**
   * @swagger
   * /api/gifts/{id}:
   *   get:
   *     tags: [礼品]
   *     summary: 获取单个礼品
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 礼品ID
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getGiftById: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const gift = await Gift.findByPk(id);
      if (!gift) {
        res.json(ResponseHandler.error('礼品不存在'));
        return;
      }
      res.json(ResponseHandler.success(gift));
    } catch (error) {
      res.json(ResponseHandler.error('获取礼品失败'));
    }
  };

  /**
   * @swagger
   * /api/gifts:
   *   post:
   *     tags: [礼品]
   *     summary: 创建新礼品
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "礼品名称"
   *               points:
   *                 type: integer
   *                 example: 100
   *               stock:
   *                 type: integer
   *                 example: 10
   *     responses:
   *       200:
   *         description: 创建成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static createGift: RequestHandler = async (req, res) => {
    try {
      const { name, points, stock } = req.body;
      const gift = await Gift.create({ name, points, stock });
      res.json(ResponseHandler.success(gift, '礼品创建成功'));
    } catch (error) {
      res.json(ResponseHandler.error('礼品创建失败'));
    }
  };

  /**
   * @swagger
   * /api/gifts/{id}:
   *   put:
   *     tags: [礼品]
   *     summary: 更新礼品信息
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 礼品ID
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "礼品名称"
   *               points:
   *                 type: integer
   *                 example: 100
   *               stock:
   *                 type: integer
   *                 example: 10
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static updateGift: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, points, stock } = req.body;
      const [updatedCount] = await Gift.update({ name, points, stock }, { where: { id } });
      if (updatedCount === 0) {
        res.json(ResponseHandler.error('礼品不存在或更新失败'));
        return;
      }
      const updatedGift = await Gift.findByPk(id);
      res.json(ResponseHandler.success(updatedGift, '礼品更新成功'));
    } catch (error) {
      res.json(ResponseHandler.error('礼品更新失败'));
    }
  };

  /**
   * @swagger
   * /api/gifts/{id}:
   *   delete:
   *     tags: [礼品]
   *     summary: 删除礼品
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 礼品ID
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: 删除成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static deleteGift: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCount = await Gift.destroy({ where: { id } });
      if (deletedCount === 0) {
        res.json(ResponseHandler.error('礼品不存在或删除失败'));
        return;
      }
      res.json(ResponseHandler.success(null, '礼品删除成功'));
    } catch (error) {
      res.json(ResponseHandler.error('礼品删除失败'));
    }
  };
  /**
   * @swagger
   * /api/gifts/redeem/{id}:
   *   post:
   *     tags: [礼品]
   *     summary: 兑换礼品
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 礼品ID
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: integer
   *                 description: 用户ID
   *                 example: 123
   *               points:
   *                 type: integer
   *                 description: 用户兑换礼品所需的积分
   *                 example: 100
   *     responses:
   *       200:
   *         description: 兑换成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: 兑换失败，积分不足或库存不足
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static redeemGift: RequestHandler = async (req, res) => {
    try {
      const { id } = req.params;  // 礼品ID
      const { userId } = req.body;  // 用户ID，兑换所需积分
      // 通过UserId查找用户积分
      const user = await User.findByPk(userId);
      // 查找礼品
      const gift = await Gift.findByPk(id);
      console.log("🚀 ~ GiftController ~ redeemGift:RequestHandler= ~ gift:", gift)
      if (!gift) {
        return res.json(ResponseHandler.error('礼品不存在'));
      }

      // 检查用户积分是否足够
      if (!user || user.points < gift.points) {
        return res.json(ResponseHandler.error('积分不足，无法兑换该礼品'));
      }

      // 检查库存是否足够
      if (gift.stock <= 0) {
        return res.json(ResponseHandler.error('库存不足，无法兑换该礼品'));
      }

      // 执行兑换：扣除积分并减少库存
      gift.stock -= 1;
      await gift.save();
      // 发送邮件通知
      const emailContent = `
        用户兑换礼品结果如下：
        用户邮箱: ${user.email}
        用户昵称: ${user.nickname}
        礼品名称: ${gift.name}
        礼品兑换所需积分: ${gift.points || '无'}
        当前积分: ${user.points - (gift.points || 0)}
      `;
      await sendMail('lihk180542@gmail.com', '兑换礼品通知', emailContent);
      // 创建兑换记录
      const redemption = await Redemption.create({
        name: gift.name,
        userId,
        giftId: id,
        pointsUsed: gift.points,
      });

      // 扣除用户积分
      await User.decrement('points', { by: gift.points, where: { id: userId } });

      // 返回成功响应
      res.json(ResponseHandler.success(redemption, '礼品兑换成功'));
    } catch (error) {
      console.error(error);
      res.json(ResponseHandler.error('礼品兑换失败'));
    }
  };
  /**
   * @swagger
   * /api/gifts/redeem/records/{userId}:
   *   get:
   *     tags: [礼品]
   *     summary: 获取用户兑换记录（分页）
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         description: 用户ID
   *         schema:
   *           type: integer
   *       - in: query
   *         name: page
   *         required: false
   *         description: 页码
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: pageSize
   *         required: false
   *         description: 每页记录数
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: 兑换记录
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: 用户ID无效或无记录
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getRedemptionRecords: RequestHandler = async (req, res) => {
    try {
      const { userId } = req.params;  // 获取用户ID
      const { page = 1, pageSize = 10 } = req.query;  // 获取分页参数，默认为第1页，每页10条记录

      // 计算偏移量
      const offset = (Number(page) - 1) * Number(pageSize);

      // 查找该用户的所有兑换记录，并实现分页
      const { rows, count } = await Redemption.findAndCountAll({
        where: { userId },
        limit: Number(pageSize),
        offset: offset,
        order: [['createdAt', 'DESC']], // 按照创建时间倒序排列
      });
      res.json(ResponseHandler.success({ total: count, rows }));
    } catch (error) {
      console.error(error);
      res.json(ResponseHandler.error('获取兑换记录失败'));
    }
  };
}
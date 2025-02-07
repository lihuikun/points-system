import { RequestHandler } from 'express';
import { Gift } from '../models/gift.model';
import { ResponseHandler } from '../utils/response';

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
}
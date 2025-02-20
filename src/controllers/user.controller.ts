import { RequestHandler } from 'express';
import { User } from '../models/user.model';
import { CheckIn } from '../models/checkin.model';
import { ResponseHandler } from '../utils/response';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

export class UserController {
  /**
   * @swagger
   * /api/user/info:
   *   get:
   *     tags: [用户]
   *     summary: 获取用户信息
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getUserInfo: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await User.findByPk(userId);
      const { friendId, friendList, friendEmail, role } = user || {}
      // 检查今天是否已签到
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCheckIn = await CheckIn.findOne({
        where: {
          userId,
          checkInDate: today
        }
      });

      // 获取连续签到天数
      const lastCheckIn = await CheckIn.findOne({
        where: { userId },
        order: [['checkInDate', 'DESC']]
      });

      res.json(ResponseHandler.success({
        id: user?.id,
        email: user?.email,
        nickname: user?.nickname,
        avatar: user?.avatar,
        points: user?.points,
        isCheckedIn: !!todayCheckIn,
        continuousDays: lastCheckIn?.continuousDays || 0,
        friendEmail,
        friendList,
        friendId,
        role
      }));
      return;
    } catch (error) {
      res.json(ResponseHandler.error('获取用户信息失败'));
      return;
    }
  };

  static getPointsHistory: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).query.userId;
      const history = await CheckIn.findAll({
        attributes: [
          'id',
          'checkInDate',
          'points',
          'continuousDays',
          'type',
          [sequelize.literal('DATE_FORMAT(checkInDate, "%Y-%m-%d")'), 'date']
        ],
        where: { userId },
        order: [['checkInDate', 'DESC']],
        limit: 30 // 最近30天的记录
      });
      console.log("🚀 ~ UserController ~ getPointsHistory:RequestHandler= ~ history:", history)

      const formattedHistory = history.map(item => ({
        id: item.id,
        date: item.get('date'),
        points: item.points || 100, // 默认签到积分
        continuousDays: item.continuousDays,
        type: item.type
      }));

      res.json(ResponseHandler.success(formattedHistory));
      return;
    } catch (error) {
      res.json(ResponseHandler.error('获取历史记录失败'));
      return;
    }
  };

  /**
   * @swagger
   * /api/user/info:
   *   put:
   *     tags: [用户]
   *     summary: 更新用户信息
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nickname:
   *                 type: string
   *                 example: "张三"
   *                 description: "用户昵称"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "zhangsan@example.com"
   *                 description: "用户邮箱"
   *     responses:
   *       200:
   *         description: 更新成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               code: 200
   *               msg: "更新成功"
   *               data:
   *                 id: 1
   *                 email: "zhangsan@example.com"
   *                 nickname: "张三"
   *                 points: 100
   */
  static updateUserInfo: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { nickname, email, avatar } = req.body;

      console.log('更新用户信息:', { userId, nickname, email, avatar });

      // 如果要更改邮箱，先检查邮箱是否已被使用
      if (email) {
        const existingUser = await User.findOne({
          where: { email, id: { [Op.ne]: userId } }
        });
        if (existingUser) {
          res.json(ResponseHandler.error('邮箱已被使用'));
          return;
        }
      }

      const [updatedCount] = await User.update(
        { nickname, email, avatar },
        { where: { id: userId } }
      );

      console.log('更新结果:', updatedCount);

      if (updatedCount === 0) {
        res.json(ResponseHandler.error('更新失败，用户不存在'));
        return;
      }

      const updatedUser = await User.findByPk(userId);
      res.json(ResponseHandler.success({
        id: updatedUser?.id,
        email: updatedUser?.email,
        nickname: updatedUser?.nickname,
        points: updatedUser?.points,
        avatar: updatedUser?.avatar
      }, '更新成功'));
      return;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.json(ResponseHandler.error('更新失败'));
      return;
    }
  };
  /**
 * @swagger
 * /api/user/password:
 *   put:
 *     tags: [用户]
 *     summary: 修改用户密码
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "oldPassword123"
 *                 description: "旧密码"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword456"
 *                 description: "新密码"
 *     responses:
 *       200:
 *         description: 修改成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 200
 *               msg: "密码修改成功"
 *               data: null
 */
static updatePassword: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.id; // 假设用户 ID 存储在 req.user 中
    const { oldPassword, newPassword } = req.body;

    // 验证用户的旧密码是否正确
    const user = await User.findByPk(userId);
    if (!user) {
      return res.json(ResponseHandler.error('用户不存在'));
    }

    // 检查旧密码是否正确
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.json(ResponseHandler.error('旧密码不正确'));
    }

    // 密码强度验证（可选）
    // if (newPassword.length < 8) { // 假设密码长度至少为 8 个字符
    //   return res.json(ResponseHandler.error('新密码太短'));
    // }

    // 加密新密码并更新
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      password: hashedPassword,
    });

    return res.json(ResponseHandler.success(null, '密码修改成功'));
  } catch (error) {
    console.error('修改密码失败:', error);
    return res.json(ResponseHandler.error('修改密码失败'));
  }
};
} 
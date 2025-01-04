import { Request, Response, RequestHandler } from 'express';
import { User } from '../models/user.model';
import { ResponseHandler } from '../utils/response';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [认证]
   *     summary: 用户注册
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: test@example.com
   *               password:
   *                 type: string
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: 注册成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               code: 200
   *               msg: "注册成功"
   *               data:
   *                 id: 1
   *                 email: "test@example.com"
   *                 points: 100
   */
  static register: RequestHandler = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.json(ResponseHandler.error('邮箱格式不正确'));
        return;
      }

      // 检查邮箱是否已存在
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.json(ResponseHandler.error('邮箱已被注册'));
        return;
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
        points: 100
      });
      
      res.json(ResponseHandler.success({ 
        id: user.id,
        email: user.email
      }, '注册成功'));
    } catch (error) {
      console.error('注册错误:', error);
      res.json(ResponseHandler.error('注册失败'));
    }
  };

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [认证]
   *     summary: 用户登录
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: test@example.com
   *               password:
   *                 type: string
   *                 example: "123456"
   *     responses:
   *       200:
   *         description: 登录成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               code: 200
   *               msg: "登录成功"
   *               data:
   *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  static login: RequestHandler = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // 检查用户是否存在
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.json(ResponseHandler.error('用户不存在'));
        return;
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.json(ResponseHandler.error('密码错误'));
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      res.json(ResponseHandler.success({ token }, '登录成功'));
    } catch (error) {
      console.error('登录错误:', error);
      res.json(ResponseHandler.error('登录失败'));
    }
  };
} 
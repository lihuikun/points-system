import { Post } from './../models/post.model';
import { RequestHandler } from 'express';
import { User } from '../models/user.model';
import { ResponseHandler } from '../utils/response';
import { Op } from 'sequelize';
import { Comment } from '../models/comment.model';
import { Like } from '../models/like.model';
export class PostController {
  /**
   * @swagger
   * /api/posts:
   *   post:
   *     tags: [朋友圈]
   *     summary: 发布朋友圈
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
   *                 type: string
   *                 description: "用户ID"
   *               content:
   *                 type: string
   *                 description: "朋友圈内容"
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: "图片链接数组"
   *               location:
   *                 type: string
   *                 description: "位置"
   *             required:
   *               - content
   *             example:
   *               userId: "1"
   *               content: "今天的风景真好！"
   *               images: ["image1.jpg", "image2.jpg"]
   *               location: "北京"
   *     responses:
   *       200:
   *         description: 发布成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static createPost: RequestHandler = async (req, res) => {
    try {
      const { content, images, location, userId } = req.body;

      const newPost = await Post.create({
        userId,
        content,
        images,
        location,
      });

      res.json(
        ResponseHandler.success(newPost, '朋友圈发布成功')
      );
      return;
    } catch (error) {
      console.error('发布朋友圈失败:', error);
      res.json(ResponseHandler.error('发布失败'));
      return;
    }
  };

  /**
   * @swagger
   * /api/posts:
   *   get:
   *     tags: [朋友圈]
   *     summary: 获取朋友圈
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *        - in: query
   *          name: userId
   *          example: "1"
   *          description: 用户ID
   *        - in: query
   *          name: page
   *          example: "1"
   *          description: 当前页码
   *        - in: query
   *          name: pageSize
   *          example: "10"
   *          description: 每页显示的记录数
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static getPosts: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).query.userId;
      const page = parseInt(req.query.page as string, 10) || 1; // 当前页码，默认为1
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10; // 每页显示的记录数，默认为10

      // 获取当前用户的好友列表
      const user = await User.findByPk(userId);
      const friendList = user?.friendList || [];
      // 包含自己在内
      const visibleUsers = [...friendList, Number(userId)];

      // 计算查询偏移量
      const offset = (page - 1) * pageSize;

      // 查询好友和自己的朋友圈
      const { rows: posts, count: total } = await Post.findAndCountAll({
        where: {
          userId: { [Op.in]: visibleUsers }, // 查询好友和自己的内容
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['nickname', 'avatar'], // 包括发布者的头像和昵称
          },
          {
            model: Like,
            as: 'likes',
            attributes: ['userId'],
            include: [
              {
                model: User,
                as: 'userInfo', // 注意这里的 `as` 必须与 Like 模型中定义的别名一致
                attributes: ['nickname', 'avatar'], // 查询点赞用户的头像和昵称
              }
            ]
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['userId', 'content', 'createdAt'],
            include: [
              {
                model: User,
                as: 'userInfo',
                attributes: ['nickname', 'avatar'], // 查询评论用户的头像和昵称
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset,
        distinct: true
      });

      // 返回分页结果
      res.json(
        ResponseHandler.success({
          rows: posts,
          total,
          page,
          pageSize,
        }, '获取朋友圈成功')
      );
    } catch (error) {
      console.error('获取朋友圈失败:', error);
      res.json(ResponseHandler.error('获取失败'));
    }
  };

  /**
   * @swagger
   * /api/posts/delete:
   *   get:
   *     tags: [朋友圈]
   *     summary: 删除朋友圈
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *        - in: query
   *          name: id
   *          example: "1"
   *          description: 朋友圈ID 
   *        - in: query
   *          name: userId
   *          example: "1"
   *          description: 用户ID
   *     responses:
   *       200:
   *         description: 获取成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  static deletePost: RequestHandler = async (req, res) => {
    try {
      const userId = (req as any).query.userId;
      const postId = req.query.id;
      console.log("🚀 ~ PostController ~ deletePost:RequestHandler= ~ postId:", userId, postId)

      // 检查是否为自己的发布
      const post = await Post.findOne({
        where: { id: postId, userId },
      });

      if (!post) {
        res.json(ResponseHandler.error('无法删除，不存在或无权限'));
        return;
      }

      // 删除发布
      await post.destroy();

      res.json(ResponseHandler.success(null, '朋友圈删除成功'));
      return;
    } catch (error) {
      console.error('删除朋友圈失败:', error);
      res.json(ResponseHandler.error('删除失败'));
      return;
    }
  };
  /**
   * @swagger
   * /api/posts/comment:
   *   post:
   *     tags: [朋友圈]
   *     summary: 添加评论
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
   *                 type: string
   *               postId:
   *                 type: string
   *               content:
   *                 type: string
   *             required:
   *               - userId
   *               - postId
   *               - content
   *     responses:
   *       200:
   *         description: 评论成功
   */
  static addComment: RequestHandler = async (req, res) => {
    try {
      const { userId, postId, content } = req.body;

      const newComment = await Comment.create({ userId, postId, content });

      console.log("🚀 ~ PostController ~ addComment:RequestHandler= ~ newComment:", newComment)
      res.json(ResponseHandler.success(newComment, '评论成功'));
    } catch (error) {
      console.error('评论失败:', error);
      res.json(ResponseHandler.error('评论失败'));
    }
  };

  /**
   * @swagger
   * /api/posts/comments:
   *   get:
   *     tags: [朋友圈]
   *     summary: 获取朋友圈评论
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *        - in: query
   *          name: postId
   *          required: true
   *          description: 朋友圈ID
   *     responses:
   *       200:
   *         description: 获取成功
   */
  static getComments: RequestHandler = async (req, res) => {
    try {
      const postId = req.query.postId as string;

      const comments = await Comment.findAll({
        where: { postId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['nickname', 'avatar'],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      res.json(ResponseHandler.success(comments, '获取评论成功'));
    } catch (error) {
      console.error('获取评论失败:', error);
      res.json(ResponseHandler.error('获取失败'));
    }
  };

  /**
 * @swagger
 * /api/posts/like:
 *   post:
 *     tags: [朋友圈]
 *     summary: 点赞或取消点赞朋友圈
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
 *                 type: string
 *               postId:
 *                 type: string
 *             required:
 *               - userId
 *               - postId
 *     responses:
 *       200:
 *         description: 操作成功
 *       400:
 *         description: 参数错误或操作失败
 */
  static likePost: RequestHandler = async (req, res) => {
    try {
      const { userId, postId } = req.body;

      // 检查是否已经点赞
      const existingLike = await Like.findOne({ where: { userId, postId } });

      if (existingLike) {
        // 如果已经点赞，则取消点赞
        await existingLike.destroy();
        return res.json(ResponseHandler.success(null, '取消点赞成功'));
      } else {
        // 如果未点赞，则添加点赞
        await Like.create({ userId, postId });
        return res.json(ResponseHandler.success(null, '点赞成功'));
      }
    } catch (error) {
      console.error('点赞/取消点赞失败:', error);
      return res.json(ResponseHandler.error('操作失败'));
    }
  };
}

import { RequestHandler } from 'express';
import axios from 'axios';
import multer from 'multer';
import { ResponseHandler } from '../utils/response';
import dotenv from 'dotenv';
import { PicGo } from 'picgo';
import GiteeUploader from 'picgo-plugin-gitee-uploader';

// 加载 .env 文件
dotenv.config();

// 配置 multer 存储选项
const storage = multer.memoryStorage(); // 使用内存存储
const upload = multer({ storage }).array('files'); // 支持多个文件上传，字段名为 'files'

// Gitee 配置
export class GiteeController {
  private static token = process.env.GITEE_TOKEN; // 从环境变量获取 token
  private static repoOwner = process.env.GITEE_REPO_OWNER; // 获取仓库拥有者
  private static repoName = process.env.GITEE_REPO_NAME; // 获取仓库名称

  /**
   * @swagger
   * /api/gitee/upload:
   *   post:
   *     tags: [Gitee]
   *     summary: 上传多个图片到 Gitee 免费图库
   *     description: 该接口用于上传多个图片到 Gitee 免费图库，支持同时上传多个图片，并返回每个图片的下载 URL。
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *             required:
   *               - files
   *     responses:
   *       200:
   *         description: 图片上传成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     urls:
   *                       type: array
   *                       items:
   *                         type: string
   *                         example: "https://gitee.com/your-repo/images/your-image.jpg"
   *       400:
   *         description: 文件上传失败
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "文件上传失败"
   *       500:
   *         description: 服务器内部错误
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "上传图片失败"
   */
  static uploadImage: RequestHandler = (req, res) => {
    upload(req, res, async (err: any) => {
      if (err) {
        return res.json(ResponseHandler.error('文件上传失败'));
      }

      const files = req.files as Express.Multer.File[];
      const fileUrls: string[] = [];

      try {
        for (let file of files) {
          console.log("🚀 ~ GiteeController ~ upload ~ file:", file)
          const fileName = file.originalname; // 图片文件路径

          // 初始化 PicGo 实例
          const picgo = new PicGo();
          picgo.use(GiteeUploader, 'gitee'); // 加载 Gitee 插件

          // 配置 PicGo 插件
          picgo.setConfig({
            "picBed": {
              "current": "gitee",
              "uploader": "gitee",
              "transformer": "gitee"
            },
            "picgoPlugins": {
              "picgo-plugin-gitee": true
            },
            "picBed.gitee": {
              "repo": "lihuikun1/pic-bed",
              "token": "268538241d7bc2e375fef56c4e156d9f",
              "path": "images/",
              "branch": "",
              "username": "lihuikun1",
              // 自定义文件名
              "customPath": 'images/$customPath'
            }
          });

          // 上传文件
          const result = await picgo.upload([file.buffer]) as any; // 上传图片
          console.log("🚀 ~ GiteeController ~ upload ~ result:", result)

          // 获取文件下载链接
          if (result && result.length > 0) {
            fileUrls.push(result[0].imgUrl); // 保存下载链接
          } else {
            return res.json(ResponseHandler.error('上传图片失败'));
          }
        }

        // 返回上传文件的下载链接
        res.json(ResponseHandler.success({ urls: fileUrls }));
      } catch (error) {
        console.error('上传图片失败:', error);
        res.json(ResponseHandler.error('上传图片失败'));
      }
    });
  };
  static getHello(): string {
    return 'Hello World!';
  }
}

import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testConnection } from './config/database';
import { User } from './models/user.model';
import { CheckIn } from './models/checkin.model';
import { LotteryBook } from './models/lotteryBook.model';
import { LotteryTicket } from './models/lotteryTicket.model';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app: Application = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 配置 - 移到最前面
app.use(cors({
  origin: 'http://localhost:5173', // 指定前端域名
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 添加 Swagger UI（放在其他路由之前）
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 路由配置
app.use('/api', routes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ message: '服务器错误' });
});

// 同步数据库表
const syncDatabase = async () => {
  try {
    await User.sync();
    await CheckIn.sync();
    await LotteryTicket.sync();
    await LotteryBook.sync();
    console.log('数据库表同步成功');
  } catch (error) {
    console.error('数据库表同步失败:', error);
  }
};

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`);
  await testConnection();
  await syncDatabase();
});

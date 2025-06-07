import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/config';

// 路由导入
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import gameRoutes from './routes/game';
import seedRoutes from './routes/seed';
import taskRoutes from './routes/task';
import aiRoutes from './routes/ai';
import levelRoutes from './routes/level';
import questionRoutes from './routes/question';
import towerDefenseRoutes from './routes/towerDefense';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// 限流配置
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.environment
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/seeds', seedRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/questions', questionRoutes);
// app.use('/api/tower-defense', towerDefenseRoutes);

// Socket.IO 连接处理
io.on('connection', (socket) => {
  logger.info(`用户连接: ${socket.id}`);
  
  socket.on('join-game', (gameId: string) => {
    socket.join(gameId);
    logger.info(`用户 ${socket.id} 加入游戏房间: ${gameId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`用户断开连接: ${socket.id}`);
  });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
async function startServer() {
  try {
    await connectDatabase();
    server.listen(config.port, () => {
      logger.info(`服务器运行在端口 ${config.port}`);
      logger.info(`允许跨域访问: ${config.corsOrigin}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

export { io }; 
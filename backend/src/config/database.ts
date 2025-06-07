import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';


dotenv.config();
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swl';


export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export async function connectDatabase(): Promise<void> {
  try {
    
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority'
    });
    
    logger.info('MongoDB 连接成功');
    
    // 监听连接事件
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB 连接错误:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB 连接断开');
    });
    
  } catch (error) {
    logger.error('MongoDB 连接失败:', error);
    throw error;
  }
} 
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-garden',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  openaiApiKey: process.env.OPENAI_API_KEY,
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  }
};

export default config; 
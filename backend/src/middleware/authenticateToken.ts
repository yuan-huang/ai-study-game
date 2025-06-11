import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 从环境变量中获取 JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'knowledge-garden';

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 从请求头中获取 token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: '无效的认证令牌' });
  }
};

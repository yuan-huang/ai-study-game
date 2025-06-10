import { Request } from 'express';

export const getUserIdFromRequest = (req: Request): string | null => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        
        const token = authHeader.split(' ')[1];
        // 这里假设token就是userId，实际项目中应该进行token验证和解析
        return token;
    } catch (error) {
        console.error('获取用户ID错误:', error);
        return null;
    }
};

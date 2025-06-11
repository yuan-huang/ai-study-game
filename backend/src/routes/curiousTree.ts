import { Router } from 'express';
import { CuriousTreeController } from '../controllers/CuriousTreeController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();
const controller = new CuriousTreeController();

// 发送消息
router.post('/chat', authenticateToken, controller.chat.bind(controller));

// 获取对话历史
router.get('/history', authenticateToken, controller.getConversationHistory.bind(controller));

// 获取成长值
router.get('/growth', authenticateToken, controller.getGrowth.bind(controller));

// 清空历史记录
router.post('/history/clear', controller.clearHistory.bind(controller));

export default router; 
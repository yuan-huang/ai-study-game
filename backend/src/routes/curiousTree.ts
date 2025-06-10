import { Router } from 'express';
import { CuriousTreeController } from '../controllers/CuriousTreeController';

const router = Router();
const controller = new CuriousTreeController();

// 发送消息
router.post('/chat', controller.chat.bind(controller));

// 获取对话历史
router.get('/history', controller.getConversationHistory.bind(controller));

// 获取成长值
router.get('/growth', controller.getGrowth.bind(controller));

// 清空历史记录
router.post('/history/clear', controller.clearHistory.bind(controller));

export default router; 
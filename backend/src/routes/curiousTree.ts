import { Router } from 'express';
import { CuriousTreeController } from '../controllers/CuriousTreeController';

const router = Router();
const controller = new CuriousTreeController();

// 发送消息
router.post('/chat', controller.chat.bind(controller));

// 获取对话历史
router.get('/history',controller.getConversationHistory.bind(controller));

export default router; 
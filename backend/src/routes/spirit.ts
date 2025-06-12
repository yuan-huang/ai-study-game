import express from 'express';
import { SpiritController } from '../controllers/SpiritController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();
const spiritController = new SpiritController();

// 检查并更新花朵血量
router.post('/check-flower-hp', authenticateToken, spiritController.checkAndUpdateFlowerHP.bind(spiritController));

// 获取欢迎语句
router.get('/welcome', authenticateToken, spiritController.getWelcomeMessage.bind(spiritController));

// 获取精灵亲密度
router.get('/intimacy', authenticateToken, spiritController.getIntimacy.bind(spiritController));

// 获取用户信息
router.get('/user-info', authenticateToken, spiritController.getUserInfo.bind(spiritController));

// 连续对话模式
router.post('/chat', authenticateToken, spiritController.chatWithSpirit.bind(spiritController));

// 流式对话模式
router.post('/chat-stream', authenticateToken, spiritController.chatWithSpiritStream.bind(spiritController));

// 获取对话历史
router.get('/chat-history', authenticateToken, spiritController.getChatHistory.bind(spiritController));

// 清除对话历史
router.post('/clear-chat-history', authenticateToken, spiritController.clearChatHistory.bind(spiritController));

// 切换 AI 模型
router.post('/switch-model', authenticateToken, spiritController.switchModel.bind(spiritController));

export default router; 
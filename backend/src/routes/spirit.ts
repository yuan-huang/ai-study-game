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

export default router; 
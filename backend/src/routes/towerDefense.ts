import { Router } from 'express';
import { TowerDefenseController } from '../controllers/TowerDefenseController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = Router();
const towerDefenseController = new TowerDefenseController();

/**
 * @route POST /api/tower-defense/data
 * @desc 获取塔防游戏所需的题目和怪物数据
 * @body subject - 学科 (chinese|math|english|curious|knowledge)
 * @body grade - 年级 (1-12)
 * @body category - 分类名称
 * @body questionCount - 题目数量 (可选，默认20)
 * @body waveCount - 波次数量 (可选，默认5)
 * @body difficulty - 难度等级 (可选，默认2)
 * @access Public
 */
router.post('/data', authenticateToken,towerDefenseController.getTowerDefenseData.bind(towerDefenseController));

/**
 * @route POST /api/tower-defense/complete
 * @desc 保存游戏通关记录并生成奖励
 * @body userId - 用户ID
 * @body subject - 学科
 * @body grade - 年级
 * @body category - 分类
 * @body questionIds - 题目ID数组
 * @body wrongQuestionIds - 答错题目ID数组
 * @body completionTime - 通关时间(毫秒)
 * @body score - 得分
 * @body comboCount - 连击数(可选)
 * @access Public
 */
router.post('/complete', authenticateToken,towerDefenseController.saveGameRecordAndGenerateReward.bind(towerDefenseController));

/**
 * @route GET /api/tower-defense/inventory/:userId
 * @desc 获取用户的花园库存
 * @param userId - 用户ID
 * @access Public
 */
router.get('/inventory/:userId', authenticateToken,towerDefenseController.getUserGardenInventory.bind(towerDefenseController));

/**
 * @route GET /api/tower-defense/stats/:userId
 * @desc 获取用户的游戏统计信息
 * @param userId - 用户ID
 * @access Public
 */
router.get('/stats/:userId', authenticateToken,towerDefenseController.getUserGameStats.bind(towerDefenseController));

export default router; 
import { Router } from 'express';
import { TowerDefenseController } from '../controllers/TowerDefenseController';

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
router.post('/data', towerDefenseController.getTowerDefenseData.bind(towerDefenseController));

export default router; 
import { Router } from 'express';
import { LevelController } from '../controllers/LevelController';

const router = Router();
const levelController = new LevelController();

/**
 * @route GET /api/levels
 * @desc 获取关卡列表
 * @query subject - 学科 (chinese|math|english|curious|knowledge)
 * @query grade - 年级 (1-12)
 * @access Public
 */
router.get('/', levelController.getLevels.bind(levelController));

/**
 * @route GET /api/levels/stats
 * @desc 获取特定关卡的统计信息
 * @query subject - 学科
 * @query grade - 年级
 * @query category - 类别
 * @access Public
 */
router.get('/stats', levelController.getLevelStats.bind(levelController));

export default router; 
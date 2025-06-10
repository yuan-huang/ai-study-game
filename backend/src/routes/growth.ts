import express from 'express';
import { body, validationResult } from 'express-validator';
import { Growth, IGrowth } from '../models/Growth';
import { logger } from '../utils/logger';

const router = express.Router();

interface GrowthUpdateRequest {
    userId: string;
    points: number;
    reason: string;
}

interface GrowthResponse {
    success: boolean;
    data?: IGrowth;
    message?: string;
    error?: string;
}

/**
 * 获取用户成长值信息
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        let growth = await Growth.findOne({ userId });

        // 如果用户没有成长记录，创建新的
        if (!growth) {
            growth = new Growth({
                userId,
                currentGrowth: 0,
                maxGrowth: 100,
                level: 1,
                totalQuestions: 0,
                totalRewards: 0,
                achievements: []
            });
            await growth.save();
            logger.info(`为用户 ${userId} 创建新的成长记录`);
        }

        const result: GrowthResponse = {
            success: true,
            data: growth
        };

        res.json(result);
    } catch (error) {
        logger.error('获取成长值信息失败:', error);
        const result: GrowthResponse = {
            success: false,
            error: '获取成长值信息失败'
        };
        res.status(500).json(result);
    }
});

/**
 * 更新用户成长值
 */
router.post('/update', [
    body('userId').notEmpty().withMessage('用户ID不能为空'),
    body('points').isInt({ min: 1 }).withMessage('成长值必须为正整数'),
    body('reason').notEmpty().withMessage('成长原因不能为空')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: '参数验证失败',
                details: errors.array()
            });
        }

        const { userId, points, reason }: GrowthUpdateRequest = req.body;

        let growth = await Growth.findOne({ userId });

        // 如果用户没有成长记录，创建新的
        if (!growth) {
            growth = new Growth({
                userId,
                currentGrowth: 0,
                maxGrowth: 100,
                level: 1,
                totalQuestions: 0,
                totalRewards: 0,
                achievements: []
            });
        }

        // 更新成长值
        growth.currentGrowth += points;
        growth.totalRewards += points;

        // 如果是提问，增加提问计数
        if (reason.includes('提问') || reason.includes('问题')) {
            growth.totalQuestions += 1;

            // 第一次提问成就
            if (growth.totalQuestions === 1 && !growth.achievements.includes('first_question')) {
                growth.achievements.push('first_question');
            }

            // 好奇探索者成就
            if (growth.totalQuestions >= 10 && !growth.achievements.includes('curious_explorer')) {
                growth.achievements.push('curious_explorer');
            }

            // 深度思考者成就
            if (growth.totalQuestions >= 50 && !growth.achievements.includes('deep_thinker')) {
                growth.achievements.push('deep_thinker');
            }

            // 知识探求者成就
            if (growth.totalQuestions >= 100 && !growth.achievements.includes('knowledge_seeker')) {
                growth.achievements.push('knowledge_seeker');
            }
        }

        // 检查是否需要升级
        let leveledUp = false;
        while (growth.currentGrowth >= growth.maxGrowth) {
            growth.currentGrowth -= growth.maxGrowth;
            growth.level += 1;
            growth.maxGrowth += 20; // 每级增加20点最大成长值
            leveledUp = true;

            // 智慧之树成就
            if (growth.level >= 10 && !growth.achievements.includes('wisdom_tree')) {
                growth.achievements.push('wisdom_tree');
            }
        }

        await growth.save();

        logger.info(`用户 ${userId} 成长值更新: +${points} (${reason}), 当前等级: ${growth.level}`);

        const result: GrowthResponse = {
            success: true,
            data: growth,
            message: leveledUp ? '恭喜升级！' : '成长值更新成功'
        };

        res.json(result);
    } catch (error) {
        logger.error('更新成长值失败:', error);
        const result: GrowthResponse = {
            success: false,
            error: '更新成长值失败'
        };
        res.status(500).json(result);
    }
});

/**
 * 获取成长排行榜
 */
router.get('/leaderboard/top', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const topUsers = await Growth.find({})
            .sort({ level: -1, currentGrowth: -1, totalRewards: -1 })
            .limit(limit)
            .select('userId level currentGrowth maxGrowth totalQuestions totalRewards achievements');

        res.json({
            success: true,
            data: topUsers
        });
    } catch (error) {
        logger.error('获取排行榜失败:', error);
        res.status(500).json({
            success: false,
            error: '获取排行榜失败'
        });
    }
});

/**
 * 获取用户成就列表
 */
router.get('/:userId/achievements', async (req, res) => {
    try {
        const { userId } = req.params;

        const growth = await Growth.findOne({ userId });
        if (!growth) {
            return res.status(404).json({
                success: false,
                error: '用户成长记录不存在'
            });
        }

        const achievementDetails = {
            first_question: {
                name: '初次提问',
                description: '提出了第一个问题',
                icon: '🌱',
                unlocked: growth.achievements.includes('first_question')
            },
            curious_explorer: {
                name: '好奇探索者',
                description: '累计提问10次',
                icon: '🔍',
                unlocked: growth.achievements.includes('curious_explorer')
            },
            deep_thinker: {
                name: '深度思考者',
                description: '累计提问50次',
                icon: '🧠',
                unlocked: growth.achievements.includes('deep_thinker')
            },
            knowledge_seeker: {
                name: '知识探求者',
                description: '累计提问100次',
                icon: '📚',
                unlocked: growth.achievements.includes('knowledge_seeker')
            },
            wisdom_tree: {
                name: '智慧之树',
                description: '达到10级',
                icon: '🌳',
                unlocked: growth.achievements.includes('wisdom_tree')
            }
        };

        res.json({
            success: true,
            data: {
                achievements: achievementDetails,
                unlockedCount: growth.achievements.length,
                totalCount: Object.keys(achievementDetails).length
            }
        });
    } catch (error) {
        logger.error('获取成就列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取成就列表失败'
        });
    }
});

export default router; 
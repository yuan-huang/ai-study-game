import express from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const router = express.Router();

// 获取用户排行榜
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'level', limit = 20 } = req.query;
    
    let sortField = {};
    switch (type) {
      case 'level':
        sortField = { level: -1, experience: -1 };
        break;
      case 'experience':
        sortField = { experience: -1 };
        break;
      case 'coins':
        sortField = { coins: -1 };
        break;
      default:
        sortField = { level: -1, experience: -1 };
    }

    const users = await User.find({})
      .select('username displayName level experience coins avatar')
      .sort(sortField)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    logger.error('获取排行榜错误:', error);
    res.status(500).json({
      success: false,
      error: '获取排行榜失败'
    });
  }
});

// 更新用户信息
router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // 过滤允许更新的字段
    const allowedFields = ['displayName', 'avatar', 'subjects'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: '更新用户信息失败'
    });
  }
});

// 获取用户统计信息
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    const stats = {
      totalSeeds: user.inventory.seeds.length,
      totalTools: user.inventory.tools.length,
      totalFruits: user.inventory.fruits.length,
      completedTasks: user.gameProgress.completedTasks.length,
      achievements: user.gameProgress.achievements.length,
      loginStreak: calculateLoginStreak(user.loginHistory),
      joinDate: user.createdAt
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户统计失败'
    });
  }
});

// 计算登录连续天数
function calculateLoginStreak(loginHistory: any): number {
  // 简化实现，实际应该基于日期计算
  return Math.min(loginHistory.loginCount, 30);
}

export default router; 
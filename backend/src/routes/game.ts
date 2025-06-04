import express from 'express';
import { User } from '../models/User';
import { Seed } from '../models/Seed';
import { logger } from '../utils/logger';

const router = express.Router();

// 获取游戏配置
router.get('/config', (req, res) => {
  const config = {
    subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'],
    grades: Array.from({ length: 12 }, (_, i) => i + 1),
    taskTypes: {
      watering: { name: '浇水', description: '学习知识点', icon: '💧' },
      fertilizing: { name: '施肥', description: '复习题目', icon: '🌱' },
      pest_control: { name: '除虫', description: '错题巩固', icon: '🐛' },
      harvest: { name: '收获', description: '获得奖励', icon: '🌾' }
    },
    seedTypes: {
      flower: { name: '花朵', difficulty: 1, growthTime: 3 },
      fruit: { name: '果实', difficulty: 2, growthTime: 4 },
      vegetable: { name: '蔬菜', difficulty: 3, growthTime: 5 },
      tree: { name: '树木', difficulty: 4, growthTime: 6 }
    },
    miniGames: [
      { id: 'airplane', name: '飞机闯关', cost: 50, description: '驾驶飞机闯过障碍' },
      { id: 'tower_defense', name: '植物守塔', cost: 80, description: '使用植物防御敌人' },
      { id: 'pet_care', name: '宠物养成', cost: 100, description: '照顾可爱的宠物' }
    ]
  };

  res.json({
    success: true,
    data: config
  });
});

// 获取游戏统计
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSeeds = await Seed.countDocuments();
    const matureSeeds = await Seed.countDocuments({ status: 'mature' });
    const harvestedSeeds = await Seed.countDocuments({ status: 'harvested' });
    
    // 获取最活跃的科目
    const subjectStats = await Seed.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 获取年级分布
    const gradeStats = await User.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSeeds,
        matureSeeds,
        harvestedSeeds,
        completionRate: totalSeeds > 0 ? (harvestedSeeds / totalSeeds * 100).toFixed(1) : 0,
        subjectStats,
        gradeStats
      }
    });

  } catch (error) {
    logger.error('获取游戏统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取游戏统计失败'
    });
  }
});

// 每日签到
router.post('/checkin/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLogin = new Date(user.loginHistory.lastLogin);
    lastLogin.setHours(0, 0, 0, 0);

    // 检查是否今天已签到
    if (lastLogin.getTime() === today.getTime()) {
      return res.status(400).json({
        success: false,
        error: '今天已经签到过了'
      });
    }

    // 签到奖励
    const dailyReward = {
      coins: 10 + user.level,
      experience: 5 + Math.floor(user.level / 2)
    };

    user.coins += dailyReward.coins;
    user.experience += dailyReward.experience;
    user.loginHistory.lastLogin = new Date();
    user.loginHistory.loginCount += 1;
    
    await user.save();

    res.json({
      success: true,
      data: {
        rewards: dailyReward,
        streak: calculateStreak(user.loginHistory)
      }
    });

  } catch (error) {
    logger.error('签到错误:', error);
    res.status(500).json({
      success: false,
      error: '签到失败'
    });
  }
});

// 购买道具
router.post('/shop/buy', async (req, res) => {
  try {
    const { userId, itemType, itemId, quantity = 1 } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 道具价格表
    const prices = {
      tools: {
        'watering_can': 50,
        'fertilizer': 30,
        'pesticide': 40,
        'harvest_tool': 60
      },
      seeds: {
        'basic_flower': 20,
        'basic_fruit': 35,
        'basic_vegetable': 25,
        'basic_tree': 50
      }
    };

    const price = prices[itemType]?.[itemId];
    if (!price) {
      return res.status(400).json({
        success: false,
        error: '道具不存在'
      });
    }

    const totalCost = price * quantity;
    if (user.coins < totalCost) {
      return res.status(400).json({
        success: false,
        error: '金币不足'
      });
    }

    // 扣除金币并添加道具
    user.coins -= totalCost;
    
    if (itemType === 'tools') {
      for (let i = 0; i < quantity; i++) {
        user.inventory.tools.push(itemId);
      }
    } else if (itemType === 'seeds') {
      for (let i = 0; i < quantity; i++) {
        user.inventory.seeds.push(itemId);
      }
    }

    await user.save();

    res.json({
      success: true,
      data: {
        remainingCoins: user.coins,
        purchasedItems: { type: itemType, id: itemId, quantity }
      }
    });

  } catch (error) {
    logger.error('购买道具错误:', error);
    res.status(500).json({
      success: false,
      error: '购买道具失败'
    });
  }
});

// 计算连续签到天数
function calculateStreak(loginHistory: any): number {
  // 简化实现
  return Math.min(loginHistory.loginCount, 30);
}

export default router; 
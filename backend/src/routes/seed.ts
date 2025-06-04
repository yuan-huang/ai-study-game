import express from 'express';
import { body, validationResult } from 'express-validator';
import { Seed } from '../models/Seed';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const router = express.Router();

// 获取用户的种子列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, subject } = req.query;
    
    let query: any = { owner: userId };
    if (status) query.status = status;
    if (subject) query.subject = subject;
    
    const seeds = await Seed.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: seeds
    });
    
  } catch (error) {
    logger.error('获取种子列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取种子列表失败'
    });
  }
});

// 种植种子
router.post('/:seedId/plant', [
  body('position.x').isNumeric().withMessage('X坐标必须是数字'),
  body('position.y').isNumeric().withMessage('Y坐标必须是数字')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { seedId } = req.params;
    const { position } = req.body;
    
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({
        success: false,
        error: '种子不存在'
      });
    }
    
    if (seed.status !== 'seed') {
      return res.status(400).json({
        success: false,
        error: '种子已经被种植'
      });
    }
    
    seed.status = 'growing';
    seed.planted_at = new Date();
    await seed.save();
    
    res.json({
      success: true,
      data: seed
    });
    
  } catch (error) {
    logger.error('种植种子错误:', error);
    res.status(500).json({
      success: false,
      error: '种植种子失败'
    });
  }
});

// 完成任务
router.post('/:seedId/task/:taskType', async (req, res) => {
  try {
    const { seedId, taskType } = req.params;
    const { score } = req.body;
    
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({
        success: false,
        error: '种子不存在'
      });
    }
    
    // 找到当前阶段和任务
    const currentStage = seed.growth_stages[seed.current_stage];
    if (!currentStage) {
      return res.status(400).json({
        success: false,
        error: '当前阶段不存在'
      });
    }
    
    const task = currentStage.tasks.find(t => t.type === taskType);
    if (!task) {
      return res.status(400).json({
        success: false,
        error: '任务不存在'
      });
    }
    
    if (task.completed) {
      return res.status(400).json({
        success: false,
        error: '任务已完成'
      });
    }
    
    // 标记任务完成
    task.completed = true;
    if (score) task.score = score;
    
    // 检查是否所有任务都完成
    const allTasksCompleted = currentStage.tasks.every(t => t.completed);
    if (allTasksCompleted) {
      seed.current_stage += 1;
      
      // 如果是最后一个阶段，标记为成熟
      if (seed.current_stage >= seed.growth_stages.length) {
        seed.status = 'mature';
      }
    }
    
    await seed.save();
    
    // 给用户奖励
    const user = await User.findById(seed.owner);
    if (user) {
      const taskReward = calculateTaskReward(seed.grade, taskType);
      user.experience += taskReward.experience;
      user.coins += taskReward.coins;
      await user.save();
    }
    
    res.json({
      success: true,
      data: {
        seed,
        rewards: calculateTaskReward(seed.grade, taskType)
      }
    });
    
  } catch (error) {
    logger.error('完成任务错误:', error);
    res.status(500).json({
      success: false,
      error: '完成任务失败'
    });
  }
});

// 收获种子
router.post('/:seedId/harvest', async (req, res) => {
  try {
    const { seedId } = req.params;
    
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({
        success: false,
        error: '种子不存在'
      });
    }
    
    if (seed.status !== 'mature') {
      return res.status(400).json({
        success: false,
        error: '种子尚未成熟'
      });
    }
    
    // 标记为已收获
    seed.status = 'harvested';
    await seed.save();
    
    // 给用户奖励
    const user = await User.findById(seed.owner);
    if (user) {
      user.experience += seed.rewards.experience;
      user.coins += seed.rewards.coins;
      user.inventory.fruits.push(...seed.rewards.fruits);
      await user.save();
    }
    
    res.json({
      success: true,
      data: {
        seed,
        rewards: seed.rewards
      }
    });
    
  } catch (error) {
    logger.error('收获种子错误:', error);
    res.status(500).json({
      success: false,
      error: '收获种子失败'
    });
  }
});

// 计算任务奖励
function calculateTaskReward(grade: number, taskType: string) {
  const baseReward = grade * 5;
  const multiplier = {
    'watering': 1,
    'fertilizing': 1.2,
    'pest_control': 1.5,
    'harvest': 2
  };
  
  return {
    experience: Math.floor(baseReward * (multiplier[taskType] || 1)),
    coins: Math.floor(baseReward * 0.5 * (multiplier[taskType] || 1))
  };
}

export default router; 
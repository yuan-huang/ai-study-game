import express from 'express';
import { Seed } from '../models/Seed';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const router = express.Router();

// 获取用户当前任务列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 获取用户正在进行的种子
    const activeSeeds = await Seed.find({
      owner: userId,
      status: { $in: ['growing', 'mature'] }
    });

    const tasks = [];
    
    for (const seed of activeSeeds) {
      const currentStage = seed.growth_stages[seed.current_stage];
      if (currentStage) {
        for (const task of currentStage.tasks) {
          if (!task.completed) {
            tasks.push({
              seedId: seed._id,
              seedName: seed.name,
              taskType: task.type,
              taskName: getTaskName(task.type),
              description: getTaskDescription(task.type),
              difficulty: seed.difficulty,
              subject: seed.subject,
              estimatedTime: getEstimatedTime(task.type),
              rewards: calculateTaskRewards(seed.grade, task.type)
            });
          }
        }
      }
    }

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    logger.error('获取任务列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取任务列表失败'
    });
  }
});

// 开始任务
router.post('/start', async (req, res) => {
  try {
    const { seedId, taskType, userId } = req.body;
    
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({
        success: false,
        error: '种子不存在'
      });
    }

    if (seed.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权限操作此种子'
      });
    }

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

    // 返回任务详情和学习内容
    const taskContent = await generateTaskContent(seed, taskType);
    
    res.json({
      success: true,
      data: {
        task: {
          seedId,
          taskType,
          seedName: seed.name,
          subject: seed.subject,
          knowledgePoints: seed.knowledge_points,
          difficulty: seed.difficulty
        },
        content: taskContent
      }
    });

  } catch (error) {
    logger.error('开始任务错误:', error);
    res.status(500).json({
      success: false,
      error: '开始任务失败'
    });
  }
});

// 提交任务结果
router.post('/submit', async (req, res) => {
  try {
    const { seedId, taskType, answers, timeSpent, score } = req.body;
    
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({
        success: false,
        error: '种子不存在'
      });
    }

    const currentStage = seed.growth_stages[seed.current_stage];
    const task = currentStage?.tasks.find(t => t.type === taskType);
    
    if (!task) {
      return res.status(400).json({
        success: false,
        error: '任务不存在'
      });
    }

    // 计算分数（如果没有提供的话）
    let finalScore = score;
    if (!finalScore && answers) {
      finalScore = calculateScore(answers, taskType);
    }

    // 标记任务完成
    task.completed = true;
    task.score = finalScore;

    // 检查阶段是否完成
    const allTasksCompleted = currentStage.tasks.every(t => t.completed);
    if (allTasksCompleted) {
      seed.current_stage += 1;
      if (seed.current_stage >= seed.growth_stages.length) {
        seed.status = 'mature';
      }
    }

    await seed.save();

    // 给用户奖励
    const user = await User.findById(seed.owner);
    if (user) {
      const rewards = calculateTaskRewards(seed.grade, taskType, finalScore);
      user.experience += rewards.experience;
      user.coins += rewards.coins;
      
      // 更新用户等级
      const newLevel = calculateLevel(user.experience);
      if (newLevel > user.level) {
        user.level = newLevel;
      }
      
      await user.save();
    }

    res.json({
      success: true,
      data: {
        completed: true,
        score: finalScore,
        rewards: calculateTaskRewards(seed.grade, taskType, finalScore),
        stageCompleted: allTasksCompleted,
        seedMature: seed.status === 'mature'
      }
    });

  } catch (error) {
    logger.error('提交任务错误:', error);
    res.status(500).json({
      success: false,
      error: '提交任务失败'
    });
  }
});

// 工具函数
function getTaskName(taskType: string): string {
  const names = {
    watering: '浇水学习',
    fertilizing: '施肥复习', 
    pest_control: '除虫巩固',
    harvest: '收获成果'
  };
  return names[taskType] || taskType;
}

function getTaskDescription(taskType: string): string {
  const descriptions = {
    watering: '观看教学视频，学习新知识点',
    fertilizing: '完成复习题目，巩固所学内容',
    pest_control: '重做错题，消除知识盲点',
    harvest: '总结学习成果，获得奖励'
  };
  return descriptions[taskType] || '';
}

function getEstimatedTime(taskType: string): number {
  const times = {
    watering: 15,  // 分钟
    fertilizing: 20,
    pest_control: 25,
    harvest: 10
  };
  return times[taskType] || 15;
}

function calculateTaskRewards(grade: number, taskType: string, score: number = 80): any {
  const baseReward = grade * 5;
  const multiplier = {
    watering: 1,
    fertilizing: 1.2,
    pest_control: 1.5,
    harvest: 2
  };
  
  const scoreMultiplier = score / 100;
  
  return {
    experience: Math.floor(baseReward * (multiplier[taskType] || 1) * scoreMultiplier),
    coins: Math.floor(baseReward * 0.5 * (multiplier[taskType] || 1) * scoreMultiplier)
  };
}

async function generateTaskContent(seed: any, taskType: string): Promise<any> {
  // 这里应该调用AI服务生成内容
  // 暂时返回模拟内容
  const mockContent = {
    watering: {
      type: 'video',
      title: `${seed.knowledge_points[0]} - 教学视频`,
      duration: '15分钟',
      url: '/mock-video-url',
      transcript: '这是一个关于知识点的详细讲解...'
    },
    fertilizing: {
      type: 'quiz',
      title: `${seed.subject} - 复习题`,
      questions: [
        {
          id: 1,
          question: '关于该知识点的第一个问题？',
          options: ['选项A', '选项B', '选项C', '选项D'],
          correct: 0
        }
      ]
    },
    pest_control: {
      type: 'practice',
      title: '错题巩固练习',
      exercises: [
        {
          id: 1,
          question: '这是一道错题重做...',
          explanation: '详细解释为什么这个答案是正确的...'
        }
      ]
    }
  };

  return mockContent[taskType] || { type: 'text', content: '任务内容' };
}

function calculateScore(answers: any[], taskType: string): number {
  // 简化的评分逻辑
  return Math.floor(Math.random() * 40) + 60; // 60-100分
}

function calculateLevel(experience: number): number {
  // 简单的等级计算：每100经验升一级
  return Math.floor(experience / 100) + 1;
}

export default router; 
import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { Seed } from '../models/Seed';
import { User } from '../models/User';

const router = express.Router();

// 生成种子（根据年级和科目）
router.post('/generate-seed', [
  body('grade').isInt({ min: 1, max: 12 }).withMessage('年级必须在1-12之间'),
  body('subject').notEmpty().withMessage('科目不能为空'),
  body('topic').notEmpty().withMessage('主题不能为空'),
  body('userId').notEmpty().withMessage('用户ID不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { grade, subject, topic, userId } = req.body;

    // 设置SSE头部
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 发送开始事件
    res.write(`data: ${JSON.stringify({ type: 'start', message: '开始生成种子...' })}\n\n`);

    // 模拟AI生成过程（实际应用中调用OpenAI API或MCP服务）
    const steps = [
      '分析年级和科目要求...',
      '生成知识点列表...',
      '设计成长阶段...',
      '配置任务奖励...',
      '创建种子数据...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      res.write(`data: ${JSON.stringify({ 
        type: 'progress', 
        message: steps[i], 
        progress: (i + 1) / steps.length * 100 
      })}\n\n`);
    }

    // 创建种子数据
    const seedData = {
      name: `${topic}种子`,
      type: 'flower',
      subject,
      grade,
      knowledge_points: [
        `${topic}基础概念`,
        `${topic}应用实例`,
        `${topic}进阶理解`
      ],
      difficulty: Math.min(Math.floor(grade / 3) + 1, 5),
      growth_stages: [
        {
          stage: 'seedling',
          tasks: [
            { type: 'watering', completed: false },
            { type: 'fertilizing', completed: false }
          ]
        },
        {
          stage: 'growing',
          tasks: [
            { type: 'watering', completed: false },
            { type: 'pest_control', completed: false }
          ]
        },
        {
          stage: 'flowering',
          tasks: [
            { type: 'fertilizing', completed: false },
            { type: 'pest_control', completed: false }
          ]
        },
        {
          stage: 'fruiting',
          tasks: [
            { type: 'harvest', completed: false }
          ]
        }
      ],
      rewards: {
        experience: grade * 10,
        coins: grade * 5,
        fruits: [`${topic}果实`]
      },
      owner: userId
    };

    const seed = new Seed(seedData);
    await seed.save();

    // 发送完成事件
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      message: '种子生成完成！', 
      data: seed 
    })}\n\n`);

    res.end();
    logger.info(`为用户 ${userId} 生成种子: ${seed.name}`);

  } catch (error) {
    logger.error('生成种子错误:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      message: '生成种子失败' 
    })}\n\n`);
    res.end();
  }
});

// 生成学习内容
router.post('/generate-content', [
  body('seedId').notEmpty().withMessage('种子ID不能为空'),
  body('taskType').isIn(['watering', 'fertilizing', 'pest_control']).withMessage('任务类型无效')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { seedId, taskType } = req.body;
    const seed = await Seed.findById(seedId);

    if (!seed) {
      return res.status(404).json({
        success: false,
        error: '种子不存在'
      });
    }

    // 设置SSE头部
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    let contentType = '';
    let content = '';

    switch (taskType) {
      case 'watering':
        contentType = '学习视频';
        content = `关于${seed.knowledge_points[0]}的教学内容...`;
        break;
      case 'fertilizing':
        contentType = '复习题目';
        content = `${seed.subject}复习题目集合...`;
        break;
      case 'pest_control':
        contentType = '错题巩固';
        content = `针对${seed.subject}的错题分析...`;
        break;
    }

    // 模拟流式生成内容
    const chunks = content.split('');
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      res.write(`data: ${JSON.stringify({ 
        type: 'content', 
        chunk: chunks[i],
        complete: i === chunks.length - 1
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    logger.error('生成内容错误:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      message: '生成内容失败' 
    })}\n\n`);
    res.end();
  }
});

export default router; 
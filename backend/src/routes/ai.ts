import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { Seed } from '../models/Seed';
import { User } from '../models/User';
import axios from 'axios';

const router = express.Router();

interface GeminiRequest {
  question: string;
}

interface GeminiResponse {
  answer: string;
  success: boolean;
  error?: string;
}

// Gemini API 配置
const GEMINI_API_URL = 'http://65.49.206.62:17888/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM';

// 生成种子（根据年级和科目）
router.post('/generate-seed', [
  body('grade').isInt({ min: 1, max: 12 }).withMessage('年级必须在1-12之间'),
  body('subject').notEmpty().withMessage('科目不能为空'),
  body('topic').notEmpty().withMessage('主题不能为空'),
  body('userId').notEmpty().withMessage('用户ID不能为空')
], async (req: Request, res: Response) => {
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
], async (req: Request, res: Response) => {
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

/**
 * 调用 Gemini AI 回答问题
 */
router.post('/ask', async (req: Request, res: Response) => {
  try {
    const { question }: GeminiRequest = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '问题不能为空'
      });
    }

    // 构建更好的提示词
    const prompt = `你是好奇树AI，一个充满智慧的古老大树，专门帮助学生学习和探索知识。你的性格温和友善，喜欢用生动有趣的方式解释复杂的概念。请用中文回答问题，语气要亲切自然。

特点：
- 对自然科学、生物、环境等话题特别擅长
- 善于用类比和故事来解释复杂概念
- 经常用树、植物、自然的比喻
- 语气温暖，像一位智慧的长者

用户问题：${question}

请以好奇树的身份回答：`;

    // 调用 Gemini API
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 1000
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Auth': 'KnowledgeGarden'
        },
        timeout: 30000 // 30秒超时
      }
    );

    const answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我无法回答这个问题。';

    const result: GeminiResponse = {
      success: true,
      answer: answer.trim()
    };

    res.json(result);
  } catch (error: any) {
    console.error('Gemini API 调用失败:', error);

    let errorMessage = 'AI 服务暂时不可用，请稍后再试。';

    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后再试。';
    } else if (error.response?.status === 400) {
      errorMessage = '请求格式错误，请重新输入问题。';
    } else if (error.response?.status === 403) {
      errorMessage = 'API 访问受限，请联系管理员。';
    }

    const result: GeminiResponse = {
      success: false,
      answer: '',
      error: errorMessage
    };

    res.status(500).json(result);
  }
});

// 智能评分和回答 API
router.post('/smart-ask', async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '问题不能为空'
      });
    }

    // 1. 先评估问题质量
    const scoreResult = await evaluateQuestionQuality(question);

    // 2. 生成回答
    const answerResult = await generateAnswer(question);

    if (answerResult.success) {
      return res.json({
        success: true,
        answer: answerResult.answer,
        score: scoreResult.score,
        scoreReason: scoreResult.reason
      });
    } else {
      return res.status(500).json({
        success: false,
        error: answerResult.error
      });
    }

  } catch (error) {
    console.error('智能评分和回答失败:', error);
    return res.status(500).json({
      success: false,
      error: '好奇树暂时无法思考，请稍后再试'
    });
  }
});

// 评估问题质量的函数
async function evaluateQuestionQuality(question: string): Promise<{ score: number, reason: string }> {
  const evaluationPrompt = `你是一个专业的教育评估专家，负责评估儿童提出的问题的教育价值。

请根据以下标准对这个问题进行评分（1-20分）：

评分标准：
- 1-5分：非常简单的是非题或极其基础的问题
- 6-10分：一般性问题，有一定的学习价值
- 11-15分：很好的问题，能激发思考和探索
- 16-20分：优秀的问题，具有深度思考价值，能够促进创新思维

考虑因素：
1. 创造性：问题是否需要创新思维
2. 深度：问题是否触及本质或原理
3. 跨学科性：问题是否涉及多个知识领域
4. 实用性：问题是否与现实生活相关
5. 启发性：问题是否能引发进一步的思考

儿童的问题："${question}"

请以JSON格式回答：
{
    "score": 数字(1-20),
    "reason": "简短的评分理由（不超过20字）"
}

只返回JSON，不要其他内容。`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{ text: evaluationPrompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: process.env.GEMINI_API_KEY || 'AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM'
        }
      }
    );

    const responseText = response.data.candidates[0].content.parts[0].text;

    try {
      // 尝试解析JSON响应
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const evaluation = JSON.parse(cleanedResponse);

      // 验证响应格式
      if (typeof evaluation.score === 'number' && typeof evaluation.reason === 'string') {
        return {
          score: Math.max(1, Math.min(20, evaluation.score)), // 确保分数在1-20范围内
          reason: evaluation.reason
        };
      } else {
        throw new Error('Invalid evaluation format');
      }
    } catch (parseError) {
      console.error('解析评分结果失败:', parseError);
      // 后备方案：基于问题长度和复杂度给分
      const fallbackScore = calculateFallbackScore(question);
      return {
        score: fallbackScore,
        reason: '智能评分'
      };
    }

  } catch (error) {
    console.error('问题评估失败:', error);
    // 后备方案
    const fallbackScore = calculateFallbackScore(question);
    return {
      score: fallbackScore,
      reason: '勇敢提问'
    };
  }
}

// 后备评分算法
function calculateFallbackScore(question: string): number {
  let score = 5; // 基础分

  // 根据问题长度
  if (question.length > 50) score += 3;
  else if (question.length > 20) score += 2;
  else if (question.length > 10) score += 1;

  // 检查关键词
  const thoughtfulWords = ['为什么', '怎么样', '如何', '原理', '原因', '机制', '过程', '影响', '关系', '区别', '比较'];
  const creativeWords = ['如果', '假设', '想象', '创造', '设计', '发明', '改进'];
  const scientificWords = ['科学', '实验', '观察', '现象', '规律', '理论', '证明'];

  thoughtfulWords.forEach(word => {
    if (question.includes(word)) score += 2;
  });

  creativeWords.forEach(word => {
    if (question.includes(word)) score += 3;
  });

  scientificWords.forEach(word => {
    if (question.includes(word)) score += 2;
  });

  // 检查问号数量（表示探索精神）
  const questionMarks = (question.match(/[？?]/g) || []).length;
  if (questionMarks > 1) score += 2;

  return Math.max(1, Math.min(20, score));
}

// 生成回答的函数
async function generateAnswer(question: string): Promise<{ success: boolean, answer?: string, error?: string }> {
  const answerPrompt = `你是好奇树AI，一棵充满智慧的古老大树，住在神奇的森林里。你最喜欢和充满好奇心的小朋友们一起探索世界的奥秘！

作为好奇树，你有以下特点：
- 用温暖、亲切、充满童趣的语气说话
- 擅长用生动的比喻和大自然的例子来解释复杂的概念
- 经常使用植物、动物、自然现象来举例
- 鼓励孩子们继续思考和探索
- 语言简洁易懂，适合儿童理解
- 喜欢用emoji和生动的描述

孩子问你："${question}"

请以好奇树的身份回答这个问题。回答要：
1. 用孩子能理解的语言
2. 包含2-3个生动的自然界例子或比喻
3. 在结尾鼓励孩子继续探索
4. 长度控制在150字以内
5. 语气要像一个充满智慧但又很亲切的老朋友`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{ text: answerPrompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: process.env.GEMINI_API_KEY || 'AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM'
        }
      }
    );

    const answer = response.data.candidates[0].content.parts[0].text;

    return {
      success: true,
      answer: answer.trim()
    };

  } catch (error) {
    console.error('生成回答失败:', error);
    return {
      success: false,
      error: '好奇树暂时无法回答，请稍后再试'
    };
  }
}

export default router; 
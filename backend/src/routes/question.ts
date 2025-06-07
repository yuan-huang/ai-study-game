import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';

const router = Router();
const questionController = new QuestionController();

/**
 * @route GET /api/questions
 * @desc 获取指定数量的题目
 * @query subject - 学科 (chinese|math|english|curious|knowledge)
 * @query grade - 年级 (1-12)
 * @query category - 分类名称
 * @query count - 题目数量 (可选，默认10，最大50)
 * @access Public
 */
router.get('/', questionController.getQuestions.bind(questionController));

/**
 * @route POST /api/questions/generate
 * @desc 通过AI生成新题目
 * @body subject - 学科
 * @body grade - 年级
 * @body category - 分类名称
 * @body count - 生成数量 (可选，默认5)
 * @body difficulty - 难度分数 (可选，默认2.5)
 * @body saveToDatabase - 是否保存到数据库 (可选，默认false)
 * @access Public
 */
router.post('/generate', questionController.generateQuestions.bind(questionController));

/**
 * @route POST /api/questions/tower-defense
 * @desc 获取塔防游戏所需的题目和怪物数据
 * @body subject - 学科 (chinese|math|english|curious|knowledge)
 * @body grade - 年级 (1-12)
 * @body category - 分类名称
 * @body questionCount - 题目数量 (可选，默认20)
 * @body waveCount - 波次数量 (可选，默认5)
 * @body difficulty - 难度等级 (可选，默认2)
 * @access Public
 */
router.post('/tower-defense', questionController.getTowerDefenseData.bind(questionController));

export default router; 
import { Request, Response } from 'express';
import { createQuestionModel, ILevelData, ILevelResponse } from '../models/Question';
import { logger } from '../utils/logger';

export class LevelController {
  /**
   * 统一响应格式的辅助方法
   */
  protected success(res: Response, data: any, message: string = '操作成功') {
    res.status(200).json({
      success: true,
      message,
      data
    });
  }

  protected badRequest(res: Response, message: string) {
    res.status(400).json({
      success: false,
      message
    });
  }

  protected notFound(res: Response, message: string) {
    res.status(404).json({
      success: false,
      message
    });
  }

  protected internalServerError(res: Response, message: string) {
    res.status(500).json({
      success: false,
      message
    });
  }

  /**
   * 获取关卡列表
   * @param req 请求对象
   * @param res 响应对象
   */
  async getLevels(req: Request, res: Response): Promise<void> {
    try {
      const { subject, grade } = req.query;

      // 参数验证
      if (!subject || !grade) {
        this.badRequest(res, '缺少必需参数: subject 和 grade');
        return;
      }

      const gradeNum = parseInt(grade as string);
      if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
        this.badRequest(res, '年级参数无效，应为1-12的数字');
        return;
      }

      const subjectStr = (subject as string).toLowerCase();
      const validSubjects = ['chinese', 'math', 'english', 'curious', 'knowledge'];
      if (!validSubjects.includes(subjectStr)) {
        this.badRequest(res, `学科参数无效，应为: ${validSubjects.join(', ')}`);
        return;
      }

      logger.info(`获取关卡列表: subject=${subjectStr}, grade=${gradeNum}`);

      // 获取对应的题目模型
      const QuestionModel = createQuestionModel(subjectStr, gradeNum);

      // 聚合查询获取category信息
      const categoryData = await QuestionModel.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgDifficulty: { $avg: '$difficulty_score' }
          }
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
            difficulty_score: { $round: ['$avgDifficulty', 1] }
          }
        },
        {
          $sort: { category: 1 }
        }
      ]);

      // 处理数据格式
      const categories: ILevelData[] = categoryData.map(cat => ({
        category: cat.category,
        count: cat.count,
        difficulty_score: cat.difficulty_score || 0
      }));

      // 按类别名称排序
      categories.sort((a, b) => a.category.localeCompare(b.category));

      const response: ILevelResponse = {
        subject: subjectStr,
        grade: gradeNum,
        categories
      };

      logger.info(`成功获取关卡列表: ${categories.length} 个关卡分类`);
      this.success(res, response, '获取关卡列表成功');

    } catch (error) {
      logger.error('获取关卡列表失败:', error);
      
      // 如果是集合不存在的错误
      if (error instanceof Error && error.message.includes('does not exist')) {
        this.notFound(res, '该年级和学科的题目数据不存在');
        return;
      }
      
      this.internalServerError(res, '获取关卡列表失败');
    }
  }

  /**
   * 获取特定关卡的题目统计信息
   * @param req 请求对象
   * @param res 响应对象
   */
  async getLevelStats(req: Request, res: Response): Promise<void> {
    try {
      const { subject, grade, category } = req.query;

      // 参数验证
      if (!subject || !grade || !category) {
        this.badRequest(res, '缺少必需参数: subject, grade, category');
        return;
      }

      const gradeNum = parseInt(grade as string);
      if (isNaN(gradeNum)) {
        this.badRequest(res, '年级参数无效');
        return;
      }

      const QuestionModel = createQuestionModel(subject as string, gradeNum);

      // 获取该关卡的统计信息
      const stats = await QuestionModel.aggregate([
        {
          $match: {
            category: category as string
          }
        },
        {
          $group: {
            _id: null,
            totalQuestions: { $sum: 1 },
            avgDifficulty: { $avg: '$difficulty_score' },
            avgCorrectRate: { $avg: '$correct_rate' },
            tags: { $push: '$tags' }
          }
        },
        {
          $project: {
            _id: 0,
            totalQuestions: 1,
            avgDifficulty: { $round: ['$avgDifficulty', 1] },
            avgCorrectRate: { $round: ['$avgCorrectRate', 2] },
            allTags: {
              $reduce: {
                input: '$tags',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }
            }
          }
        }
      ]);

      if (stats.length === 0) {
        this.notFound(res, '该关卡数据不存在');
        return;
      }

      const response = {
        subject: subject as string,
        grade: gradeNum,
        category: category as string,
        ...stats[0]
      };

      this.success(res, response, '获取关卡统计信息成功');

    } catch (error) {
      logger.error('获取关卡统计信息失败:', error);
      this.internalServerError(res, '获取关卡统计信息失败');
    }
  }
} 
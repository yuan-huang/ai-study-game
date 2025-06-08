import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Document } from 'mongoose';
import { logger } from '../utils/logger';
import { TowerDefenseRecord } from '../models/TowerDefenseRecord';
import { Flower } from '../models/Flower';
import { Nectar } from '../models/Nectar';
import { User } from '../models/User';
import mongoose from 'mongoose';

// 创建一个虚拟的文档接口用于BaseController
interface ITowerDefenseDoc extends Document {
  _id?: string;
}

export class TowerDefenseController extends BaseController<ITowerDefenseDoc> {
  constructor() {
    // 传入 null 作为 model，因为这个控制器主要用于数据生成而非数据库操作
    super(null as any);
  }

  /**
   * 获取塔防游戏所需的数据
   */
  async getTowerDefenseData(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        subject, 
        grade, 
        category, 
        questionCount = 20, 
        waveCount = 1, 
        difficulty = 2 
      } = req.body;

      // 参数验证
      const validationError = this.validateGameParams(subject, grade, category, questionCount, waveCount, difficulty);
      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError
        });
      }

      const gradeNum = parseInt(grade);
      const questionCountNum = parseInt(questionCount);
      const waveCountNum = parseInt(waveCount);
      const difficultyNum = parseInt(difficulty);

      logger.info(`获取塔防数据: subject=${subject}, grade=${gradeNum}, category=${category}`);

      // 生成游戏数据
      const gameData = this.generateGameData(subject, gradeNum, category, questionCountNum, waveCountNum, difficultyNum);

      logger.info(`成功获取塔防数据: ${gameData.questions.length} 道题目, ${gameData.monsters.waves.length} 个波次`);
      
      return res.status(200).json({
        success: true,
        message: '获取塔防数据成功',
        data: gameData
      });

    } catch (error) {
      logger.error('获取塔防数据失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取塔防数据失败'
      });
    }
  }

  /**
   * 验证游戏参数
   */
  private validateGameParams(subject: any, grade: any, category: any, questionCount: any, waveCount: any, difficulty: any): string | null {
    if (!subject || !grade || !category) {
      return '缺少必需参数: subject, grade, category';
    }

    const gradeNum = parseInt(grade);
    const questionCountNum = parseInt(questionCount);
    const waveCountNum = parseInt(waveCount);
    const difficultyNum = parseInt(difficulty);

    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return '年级参数无效';
    }

    if (isNaN(questionCountNum) || questionCountNum < 5 || questionCountNum > 100) {
      return '题目数量无效，应为5-100之间';
    }

    if (isNaN(waveCountNum) || waveCountNum < 1 || waveCountNum > 20) {
      return '波次数量无效，应为1-20之间';
    }

    if (isNaN(difficultyNum) || difficultyNum < 1 || difficultyNum > 5) {
      return '难度等级无效，应为1-5之间';
    }

    return null;
  }

  /**
   * 生成完整的游戏数据
   */
  private generateGameData(subject: string, grade: number, category: string, questionCount: number, waveCount: number, difficulty: number): any {
    const questions: any[] = [];
    const monsters = this.generateMonsterData(waveCount, difficulty);
    const towers = this.getTowerTypes();
    const gameConfig = this.generateGameConfig(subject, grade, category, questions.length, waveCount, difficulty);

    return {
      questions,
      monsters,
      towers,
      gameConfig
    };
  }

  /**
   * 生成游戏配置
   */
  private generateGameConfig(subject: string, grade: number, category: string, questionCount: number, waveCount: number, difficulty: number): any {
    return {
      subject,
      grade,
      category,
      questionCount,
      waveCount,
      difficulty,
      initialHealth: Math.max(5, 15 - difficulty * 2),
      initialScore: Math.max(50, 200 - difficulty * 30),
      scorePerCorrectAnswer: 20 + difficulty * 10,
      comboBonus: 5 + difficulty * 2
    };
  }



  /**
   * 生成怪物数据
   */
  private generateMonsterData(waveCount: number, difficulty: number): any {
    const monsterTypes = this.getMonsterTypes(difficulty);
    const waves = this.generateWaves(waveCount, difficulty, monsterTypes);

    return {
      types: monsterTypes,
      waves
    };
  }

  /**
   * 获取怪物类型配置
   */
  private getMonsterTypes(difficulty: number): any[] {
    return [
      {
        type: 'monster-normal',
        name: '普通怪物',
        health: 30 + difficulty * 10,
        speed: 80 + difficulty * 10,
        reward: 5 + difficulty,
        image: 'monster-normal'
      },
      {
        type: 'monster-gluttonous',
        name: '贪吃怪物',
        health: 50 + difficulty * 15,
        speed: 60 + difficulty * 8,
        reward: 8 + difficulty * 2,
        image: 'monster-gluttonous'
      },
      {
        type: 'monster-grumpy',
        name: '暴躁怪物',
        health: 80 + difficulty * 20,
        speed: 50 + difficulty * 5,
        reward: 12 + difficulty * 3,
        image: 'monster-grumpy'
      },
      {
        type: 'monster-lazy',
        name: '懒惰怪物',
        health: 70 + difficulty * 18,
        speed: 40 + difficulty * 3,
        reward: 10 + difficulty * 2,
        image: 'monster-lazy'
      },
      {
        type: 'monster-messy',
        name: '混乱怪物',
        health: 40 + difficulty * 12,
        speed: 100 + difficulty * 15,
        reward: 6 + difficulty,
        image: 'monster-messy'
      }
    ];
  }

  /**
   * 生成波次数据
   */
  private generateWaves(waveCount: number, difficulty: number, monsterTypes: any[]): any[] {
    const waves = [];
    
    for (let i = 1; i <= waveCount; i++) {
      const enemyCount = Math.min(3 + i, 8 + difficulty);
      const enemies = this.generateWaveEnemies(i, enemyCount, monsterTypes);
      
      waves.push({
        waveNumber: i,
        enemies,
        delay: Math.max(1000, 2000 - difficulty * 200),
        spawnInterval: Math.max(800, 1500 - difficulty * 100)
      });
    }

    return waves;
  }

  /**
   * 生成波次敌人
   */
  private generateWaveEnemies(waveNumber: number, enemyCount: number, monsterTypes: any[]): string[] {
    const enemies = [];
    const availableTypes = monsterTypes.slice(0, Math.min(1 + Math.floor(waveNumber / 2), monsterTypes.length));
    
    for (let j = 0; j < enemyCount; j++) {
      const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      enemies.push(randomType.type);
    }
    
    return enemies;
  }

  /**
   * 获取塔类型配置
   */
  private getTowerTypes(): any {
    return {
      'tower-arrow': {
        type: 'tower-arrow',
        name: '箭塔',
        cost: 50,
        damage: 20,
        range: 150,
        fireRate: 1000,
        level: 1,
        maxLevel: 10,
        icon: '🏹',
        description: '基础防御塔，攻击单个敌人'
      },
      'tower-freeze': {
        type: 'tower-freeze',
        name: '冰冻塔',
        cost: 70,
        damage: 15,
        range: 150,
        fireRate: 1500,
        level: 1,
        maxLevel: 10,
        icon: '❄️',
        description: '减慢敌人移动速度'
      },
      'tower-laser': {
        type: 'tower-laser',
        name: '激光塔',
        cost: 100,
        damage: 30,
        range: 180,
        fireRate: 800,
        level: 1,
        maxLevel: 10,
        icon: '⚡',
        description: '高伤害远程攻击'
      },
      'tower-poison': {
        type: 'tower-poison',
        name: '毒塔',
        cost: 70,
        damage: 10,
        range: 140,
        fireRate: 500,
        level: 1,
        maxLevel: 10,
        icon: '☠️',
        description: '持续伤害和范围攻击'
      }
    };
  }

  /**
   * 保存游戏记录并生成奖励
   */
  async saveGameRecordAndGenerateReward(req: Request, res: Response): Promise<Response> {
    try {
      const {
        userId,
        subject,
        grade,
        category,
        questionIds,
        wrongQuestionIds,
        completionTime,
        score,
        comboCount
      } = req.body;

      // 参数验证
      if (!userId || !subject || !grade || !category || !Array.isArray(questionIds) || 
          !Array.isArray(wrongQuestionIds) || typeof completionTime !== 'number' || 
          typeof score !== 'number') {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数或参数类型错误'
        });
      }

      // 验证用户是否存在
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 保存游戏记录
        const gameRecord = new TowerDefenseRecord({
          userId: new mongoose.Types.ObjectId(userId),
          subject,
          grade: parseInt(grade),
          category,
          questionIds: questionIds.map((id: string) => new mongoose.Types.ObjectId(id)),
          wrongQuestionIds: wrongQuestionIds.map((id: string) => new mongoose.Types.ObjectId(id)),
          completionTime,
          score,
          comboCount: comboCount || 0
        });

        await gameRecord.save({ session });

        // 查询该用户在此组合下的通过次数
        const completionCount = await TowerDefenseRecord.countDocuments({
          userId: new mongoose.Types.ObjectId(userId),
          subject,
          grade: parseInt(grade),
          category
        }).session(session);

        let reward: any = null;

        if (completionCount === 1) {
          // 首次通过，奖励花朵
          const flower = new Flower({
            userId: new mongoose.Types.ObjectId(userId),
            subject,
            grade: parseInt(grade),
            category,
            hp: 100,
            maxHp: 100,
            isPlanted: false
          });

          await flower.save({ session });
          reward = {
            type: 'flower',
            item: {
              id: flower._id,
              subject,
              grade: parseInt(grade),
              category,
              hp: 100,
              maxHp: 100,
              message: '恭喜获得新花朵！快去花园种植吧！'
            }
          };

          logger.info(`首次通过 年级${grade} ${category}关卡，获得花朵奖励`);
        } else {
          // 非首次通过，奖励甘露
          const nectar = new Nectar({
            userId: new mongoose.Types.ObjectId(userId),
            subject,
            grade: parseInt(grade),
            category,
            healingPower: 1
          });

          await nectar.save({ session });
          reward = {
            type: 'nectar',
            item: {
              id: nectar._id,
              subject,
              grade: parseInt(grade),
              category,
              healingPower: 1,
              message: '获得甘露！可以用来恢复花朵的生命值。'
            }
          };

          logger.info(`用户 ${userId} 再次通过 ${subject}-grade${grade}-${category}，获得甘露奖励`);
        }

        // 更新用户经验和金币
        await User.findByIdAndUpdate(
          userId,
          {
            $inc: {
              experience: Math.floor(score / 10),
              coins: Math.floor(score / 20)
            }
          },
          { session }
        );

        await session.commitTransaction();

        logger.info(`成功保存用户 ${userId} 的游戏记录并生成奖励`);

        return res.status(200).json({
          success: true,
          message: '游戏记录保存成功',
          data: {
            gameRecord: {
              id: gameRecord._id,
              completionTime,
              score,
              comboCount,
              completedAt: gameRecord.createdAt
            },
            reward,
            stats: {
              totalCompletions: completionCount,
              experienceGained: Math.floor(score / 10),
              coinsGained: Math.floor(score / 20)
            }
          }
        });

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

    } catch (error) {
      logger.error('保存游戏记录失败:', error);
      return res.status(500).json({
        success: false,
        message: '保存游戏记录失败'
      });
    }
  }

  /**
   * 获取用户的花园库存
   */
  async getUserGardenInventory(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 获取用户的花朵
      const flowers = await Flower.find({ userId: new mongoose.Types.ObjectId(userId) });
      
      // 获取用户的甘露
      const nectars = await Nectar.find({ userId: new mongoose.Types.ObjectId(userId) });

      // 按学科分组统计
      const flowersBySubject = flowers.reduce((acc: any, flower) => {
        const key = `${flower.subject}-grade${flower.grade}-${flower.category}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push({
          id: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          hp: flower.hp,
          maxHp: flower.maxHp,
          isPlanted: flower.isPlanted,
          gardenPosition: flower.isPlanted ? {
            x: flower.gardenPositionX,
            y: flower.gardenPositionY
          } : null,
          plantedAt: flower.plantedAt
        });
        return acc;
      }, {});

      const nectarsBySubject = nectars.reduce((acc: any, nectar) => {
        const key = `${nectar.subject}-grade${nectar.grade}-${nectar.category}`;
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += nectar.healingPower;
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        message: '获取花园库存成功',
        data: {
          flowers: flowersBySubject,
          nectars: nectarsBySubject,
          totalFlowers: flowers.length,
          totalNectars: nectars.length,
          plantedFlowers: flowers.filter(f => f.isPlanted).length
        }
      });

    } catch (error) {
      logger.error('获取花园库存失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取花园库存失败'
      });
    }
  }

  /**
   * 获取用户的游戏统计信息
   */
  async getUserGameStats(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 获取用户的游戏记录统计
      const records = await TowerDefenseRecord.find({ userId: new mongoose.Types.ObjectId(userId) });
      
      // 统计各学科的通过次数
      const statsBySubject = records.reduce((acc: any, record) => {
        const key = `${record.subject}-grade${record.grade}-${record.category}`;
        if (!acc[key]) {
          acc[key] = {
            subject: record.subject,
            grade: record.grade,
            category: record.category,
            completions: 0,
            bestScore: 0,
            bestTime: Infinity,
            totalScore: 0,
            averageScore: 0
          };
        }
        
        acc[key].completions++;
        acc[key].totalScore += record.score;
        acc[key].bestScore = Math.max(acc[key].bestScore, record.score);
        acc[key].bestTime = Math.min(acc[key].bestTime, record.completionTime);
        acc[key].averageScore = Math.round(acc[key].totalScore / acc[key].completions);
        
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        message: '获取游戏统计成功',
        data: {
          totalGames: records.length,
          statsBySubject: Object.values(statsBySubject),
          recentGames: records
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
            .map(record => ({
              id: record._id,
              subject: record.subject,
              grade: record.grade,
              category: record.category,
              score: record.score,
              completionTime: record.completionTime,
              wrongAnswers: record.wrongQuestionIds.length,
              completedAt: record.createdAt
            }))
        }
      });

    } catch (error) {
      logger.error('获取游戏统计失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取游戏统计失败'
      });
    }
  }
} 
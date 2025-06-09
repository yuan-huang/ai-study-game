import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Document } from 'mongoose';
import { logger } from '../utils/logger';
import { Flower } from '../models/Flower';
import { Nectar } from '../models/Nectar';
import { User } from '../models/User';
import { FlowerMemoryService } from '../services/FlowerMemoryService';
import { TowerDefenseRecord } from '../models/TowerDefenseRecord';
import { createQuestionModel } from '../models/Question';
import mongoose from 'mongoose';

// 创建一个虚拟的文档接口用于BaseController
interface IGardenDoc extends Document {
  _id?: string;
}

export class GardenController extends BaseController<IGardenDoc> {
  constructor() {
    // 传入 null 作为 model，因为这个控制器主要用于花园管理而非单一数据库操作
    super(null as any);
  }

  /**
   * 种植花朵到花园
   */
  async plantFlower(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, flowerId, position } = req.body;

      if (!userId || !flowerId || !position || !position.x || !position.y) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数: userId, flowerId, position'
        });
      }

      // 检查花朵是否存在且未种植
      const flower = await Flower.findOne({
        _id: new mongoose.Types.ObjectId(flowerId),
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: false
      });

      if (!flower) {
        return res.status(404).json({
          success: false,
          message: '花朵不存在或已被种植'
        });
      }

      // 检查位置是否被占用
      const existingFlower = await Flower.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: true,
        gardenPositionX: position.x,
        gardenPositionY: position.y
      });

      if (existingFlower) {
        return res.status(400).json({
          success: false,
          message: '该位置已被其他花朵占用'
        });
      }

      // 种植花朵
      flower.isPlanted = true;
      flower.gardenPositionX = position.x;
      flower.gardenPositionY = position.y;
      flower.plantedAt = new Date();
      await flower.save();

      logger.info(`用户 ${userId} 成功种植花朵 ${flowerId} 到位置 (${position.x}, ${position.y})`);

      return res.status(200).json({
        success: true,
        message: '花朵种植成功',
        data: {
          id: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          hp: flower.hp,
          maxHp: flower.maxHp,
          isPlanted: flower.isPlanted,
          gardenPosition: { x: flower.gardenPositionX, y: flower.gardenPositionY },
          plantedAt: flower.plantedAt
        }
      });

    } catch (error) {
      logger.error('种植花朵失败:', error);
      return res.status(500).json({
        success: false,
        message: '种植花朵失败'
      });
    }
  }

  /**
   * 收获花朵（从花园移回仓库）
   */
  async harvestFlower(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, flowerId } = req.body;

      if (!userId || !flowerId) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数: userId, flowerId'
        });
      }

      // 查找已种植的花朵
      const flower = await Flower.findOne({
        _id: new mongoose.Types.ObjectId(flowerId),
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: true
      });

      if (!flower) {
        return res.status(404).json({
          success: false,
          message: '花朵不存在或未种植'
        });
      }

      // 收获花朵
      flower.isPlanted = false;
      flower.gardenPositionX = undefined;
      flower.gardenPositionY = undefined;
      flower.plantedAt = undefined;
      await flower.save();

      logger.info(`用户 ${userId} 成功收获花朵 ${flowerId}`);

      return res.status(200).json({
        success: true,
        message: '花朵收获成功',
        data: {
          id: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          hp: flower.hp,
          maxHp: flower.maxHp,
          isPlanted: flower.isPlanted,
          gardenPosition: null,
          plantedAt: flower.plantedAt
        }
      });

    } catch (error) {
      logger.error('收获花朵失败:', error);
      return res.status(500).json({
        success: false,
        message: '收获花朵失败'
      });
    }
  }

  /**
   * 移动花朵在花园中的位置
   */
  async moveFlower(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, flowerId, newPosition } = req.body;

      if (!userId || !flowerId || !newPosition || !newPosition.x || !newPosition.y) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数: userId, flowerId, newPosition'
        });
      }

      // 查找已种植的花朵
      const flower = await Flower.findOne({
        _id: new mongoose.Types.ObjectId(flowerId),
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: true
      });

      if (!flower) {
        return res.status(404).json({
          success: false,
          message: '花朵不存在或未种植'
        });
      }

      // 检查新位置是否被占用
      const existingFlower = await Flower.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(flowerId) },
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: true,
        gardenPositionX: newPosition.x,
        gardenPositionY: newPosition.y
      });

      if (existingFlower) {
        return res.status(400).json({
          success: false,
          message: '新位置已被其他花朵占用'
        });
      }

      // 移动花朵
      flower.gardenPositionX = newPosition.x;
      flower.gardenPositionY = newPosition.y;
      await flower.save();

      logger.info(`用户 ${userId} 成功移动花朵 ${flowerId} 到新位置 (${newPosition.x}, ${newPosition.y})`);

      return res.status(200).json({
        success: true,
        message: '花朵移动成功',
        data: {
          id: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          hp: flower.hp,
          maxHp: flower.maxHp,
          isPlanted: flower.isPlanted,
          gardenPosition: { x: flower.gardenPositionX, y: flower.gardenPositionY },
          plantedAt: flower.plantedAt
        }
      });

    } catch (error) {
      logger.error('移动花朵失败:', error);
      return res.status(500).json({
        success: false,
        message: '移动花朵失败'
      });
    }
  }

  /**
   * 使用甘露治疗花朵
   */
  async healFlower(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, flowerId, nectarSubject, nectarGrade, nectarCategory, healingAmount } = req.body;

      if (!userId || !flowerId || !nectarSubject || !nectarGrade || !nectarCategory || !healingAmount) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数'
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 查找花朵
        const flower = await Flower.findOne({
          _id: new mongoose.Types.ObjectId(flowerId),
          userId: new mongoose.Types.ObjectId(userId)
        }).session(session);

        if (!flower) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            success: false,
            message: '花朵不存在'
          });
        }

        // 查找甘露
        const nectar = await Nectar.findOne({
          userId: new mongoose.Types.ObjectId(userId),
          subject: nectarSubject,
          grade: nectarGrade,
          category: nectarCategory,
          healingPower: { $gte: healingAmount }
        }).session(session);

        if (!nectar) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: '甘露不足或不存在'
          });
        }

        // 计算实际治疗量
        const actualHealing = Math.min(healingAmount, flower.maxHp - flower.hp);
        
        // 治疗花朵
        flower.hp = Math.min(flower.hp + actualHealing, flower.maxHp);
        flower.lastHealedAt = new Date();
        await flower.save({ session });

        // 消耗甘露
        nectar.healingPower -= healingAmount;
        if (nectar.healingPower <= 0) {
          await Nectar.deleteOne({ _id: nectar._id }).session(session);
        } else {
          await nectar.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        logger.info(`用户 ${userId} 使用甘露治疗花朵 ${flowerId}，恢复 ${actualHealing} HP`);

        return res.status(200).json({
          success: true,
          message: '花朵治疗成功',
          data: {
            flower: {
              id: flower._id,
              subject: flower.subject,
              grade: flower.grade,
              category: flower.category,
              hp: flower.hp,
              maxHp: flower.maxHp,
              isPlanted: flower.isPlanted,
              gardenPosition: flower.isPlanted ? { x: flower.gardenPositionX, y: flower.gardenPositionY } : null,
              plantedAt: flower.plantedAt
            },
            remainingNectar: nectar.healingPower > 0 ? nectar.healingPower : 0
          }
        });

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }

    } catch (error) {
      logger.error('治疗花朵失败:', error);
      return res.status(500).json({
        success: false,
        message: '治疗花朵失败'
      });
    }
  }

  /**
   * 获取花园布局（已种植的花朵）
   */
  async getGardenLayout(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      const plantedFlowers = await Flower.find({
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: true
      });

      const gardenLayout = plantedFlowers.map(flower => ({
        id: flower._id,
        subject: flower.subject,
        grade: flower.grade,
        category: flower.category,
        hp: flower.hp,
        maxHp: flower.maxHp,
        isPlanted: flower.isPlanted,
        gardenPosition: { x: flower.gardenPositionX, y: flower.gardenPositionY },
        plantedAt: flower.plantedAt
      }));

      return res.status(200).json({
        success: true,
        message: '获取花园布局成功',
        data: gardenLayout
      });

    } catch (error) {
      logger.error('获取花园布局失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取花园布局失败'
      });
    }
  }

  /**
   * 获取仓库中未种植的花朵
   */
  async getWarehouseFlowers(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      const warehouseFlowers = await Flower.find({
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: false
      });

      const flowers = warehouseFlowers.map(flower => ({
        id: flower._id,
        subject: flower.subject,
        grade: flower.grade,
        category: flower.category,
        hp: flower.hp,
        maxHp: flower.maxHp,
        isPlanted: flower.isPlanted,
        gardenPosition: null,
        plantedAt: null
      }));

      return res.status(200).json({
        success: true,
        message: '获取仓库花朵成功',
        data: flowers
      });

    } catch (error) {
      logger.error('获取仓库花朵失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取仓库花朵失败'
      });
    }
  }

  /**
   * 获取花园仓库道具（花朵和甘露）
   */
  async getGardenWarehouseItems(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 获取所有花朵（从塔防奖励中获得）
      const flowers = await Flower.find({ userId: new mongoose.Types.ObjectId(userId) });
      
      // 获取所有甘露（从塔防奖励中获得）
      const nectars = await Nectar.find({ userId: new mongoose.Types.ObjectId(userId) });

      // 分类整理花朵：已种植的和仓库中的
      const plantedFlowers = flowers.filter(f => f.isPlanted).map(flower => ({
        id: flower._id,
        subject: flower.subject,
        grade: flower.grade,
        category: flower.category,
        hp: flower.hp,
        maxHp: flower.maxHp,
        isPlanted: true,
        gardenPosition: { x: flower.gardenPositionX, y: flower.gardenPositionY },
        plantedAt: flower.plantedAt,
        lastHealedAt: flower.lastHealedAt
      }));

      const warehouseFlowers = flowers.filter(f => !f.isPlanted).map(flower => ({
        id: flower._id,
        subject: flower.subject,
        grade: flower.grade,
        category: flower.category,
        hp: flower.hp,
        maxHp: flower.maxHp,
        isPlanted: false,
        gardenPosition: null,
        plantedAt: null,
        lastHealedAt: flower.lastHealedAt
      }));

      // 按学科分类统计甘露（便于工具栏显示）
      const nectarSummary = nectars.reduce((acc: any, nectar) => {
        const key = `${nectar.subject}-grade${nectar.grade}-${nectar.category}`;
        if (!acc[key]) {
          acc[key] = {
            subject: nectar.subject,
            grade: nectar.grade,
            category: nectar.category,
            totalHealingPower: 0,
            count: 0,
            nectarIds: []
          };
        }
        acc[key].totalHealingPower += nectar.healingPower;
        acc[key].count += 1;
        acc[key].nectarIds.push(nectar._id);
        return acc;
      }, {});

      logger.info(`用户 ${userId} 花园库存: ${flowers.length}朵花 (${plantedFlowers.length}已种植, ${warehouseFlowers.length}在仓库), ${nectars.length}份甘露`);

      return res.status(200).json({
        success: true,
        message: '获取花园仓库道具成功',
        data: {
          plantedFlowers,
          warehouseFlowers,
          nectars: Object.values(nectarSummary),
          totalFlowers: flowers.length,
          totalNectars: nectars.length,
          plantedFlowersCount: plantedFlowers.length,
          warehouseFlowersCount: warehouseFlowers.length,
          // 额外的统计信息
          stats: {
            flowersBySubject: this.groupFlowersBySubject(flowers),
            nectarsBySubject: this.groupNectarsBySubject(nectars),
            gardenUtilization: this.calculateGardenUtilization(plantedFlowers.length)
          }
        }
      });

    } catch (error) {
      logger.error('获取花园仓库道具失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取花园仓库道具失败'
      });
    }
  }

  /**
   * 批量种植花朵
   */
  async batchPlantFlowers(req: Request, res: Response): Promise<Response> {
    try {
      const { flowers } = req.body;

      if (!flowers || !Array.isArray(flowers) || flowers.length === 0) {
        return res.status(400).json({
          success: false,
          message: '缺少花朵数据或数据格式错误'
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const plantedFlowers = [];

        for (const flowerData of flowers) {
          const { userId, flowerId, position } = flowerData;

          // 检查花朵是否存在且未种植
          const flower = await Flower.findOne({
            _id: new mongoose.Types.ObjectId(flowerId),
            userId: new mongoose.Types.ObjectId(userId),
            isPlanted: false
          }).session(session);

          if (!flower) {
            continue; // 跳过不存在或已种植的花朵
          }

          // 检查位置是否被占用
          const existingFlower = await Flower.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            isPlanted: true,
            gardenPositionX: position.x,
            gardenPositionY: position.y
          }).session(session);

          if (existingFlower) {
            continue; // 跳过被占用的位置
          }

          // 种植花朵
          flower.isPlanted = true;
          flower.gardenPositionX = position.x;
          flower.gardenPositionY = position.y;
          flower.plantedAt = new Date();
          await flower.save({ session });

          plantedFlowers.push({
            id: flower._id,
            subject: flower.subject,
            grade: flower.grade,
            category: flower.category,
            hp: flower.hp,
            maxHp: flower.maxHp,
            isPlanted: flower.isPlanted,
            gardenPosition: { x: flower.gardenPositionX, y: flower.gardenPositionY },
            plantedAt: flower.plantedAt
          });
        }

        await session.commitTransaction();
        session.endSession();

        logger.info(`批量种植花朵成功，共种植 ${plantedFlowers.length} 朵花`);

        return res.status(200).json({
          success: true,
          message: `批量种植成功，共种植 ${plantedFlowers.length} 朵花`,
          data: plantedFlowers
        });

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }

    } catch (error) {
      logger.error('批量种植花朵失败:', error);
      return res.status(500).json({
        success: false,
        message: '批量种植花朵失败'
      });
    }
  }

  /**
   * 自动种植花朵（系统自动选择位置）
   */
  async autoPlantFlower(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, flowerId } = req.body;

      if (!userId || !flowerId) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数: userId, flowerId'
        });
      }

      // 检查花朵是否存在且未种植
      const flower = await Flower.findOne({
        _id: new mongoose.Types.ObjectId(flowerId),
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: false
      });

      if (!flower) {
        return res.status(404).json({
          success: false,
          message: '花朵不存在或已被种植'
        });
      }

      // 获取已占用的位置
      const occupiedPositions = await Flower.find({
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: true
      }).select('gardenPositionX gardenPositionY');

      const occupiedSet = new Set(
        occupiedPositions.map(p => `${p.gardenPositionX},${p.gardenPositionY}`)
      );

      // 找到一个空闲位置 (假设花园是10x10的网格)
      let foundPosition = null;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          if (!occupiedSet.has(`${x},${y}`)) {
            foundPosition = { x, y };
            break;
          }
        }
        if (foundPosition) break;
      }

      if (!foundPosition) {
        return res.status(400).json({
          success: false,
          message: '花园已满，无法自动种植'
        });
      }

      // 种植花朵
      flower.isPlanted = true;
      flower.gardenPositionX = foundPosition.x;
      flower.gardenPositionY = foundPosition.y;
      flower.plantedAt = new Date();
      await flower.save();

      logger.info(`用户 ${userId} 自动种植花朵 ${flowerId} 到位置 (${foundPosition.x}, ${foundPosition.y})`);

      return res.status(200).json({
        success: true,
        message: '花朵自动种植成功',
        data: {
          id: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          hp: flower.hp,
          maxHp: flower.maxHp,
          isPlanted: flower.isPlanted,
          gardenPosition: { x: flower.gardenPositionX, y: flower.gardenPositionY },
          plantedAt: flower.plantedAt
        }
      });

    } catch (error) {
      logger.error('自动种植花朵失败:', error);
      return res.status(500).json({
        success: false,
        message: '自动种植花朵失败'
      });
    }
  }

  /**
   * 获取花园中所有花朵（应用遗忘曲线计算实时HP）
   */
  async getGardenFlowersWithMemory(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 获取花园中所有已种植的花朵
      const gardenFlowers = await Flower.find({
        userId: new mongoose.Types.ObjectId(userId),
        isPlanted: true
      });

      if (gardenFlowers.length === 0) {
        return res.status(200).json({
          success: true,
          message: '花园中暂无花朵',
          data: {
            flowers: [],
            memoryHealth: {
              averageHP: 0,
              totalFlowers: 0,
              healthyFlowers: 0,
              criticalFlowers: 0,
              overallGrade: 'N/A',
              recommendations: ['暂无花朵，开始学习获得新花朵吧！']
            }
          }
        });
      }

      // 使用遗忘曲线服务计算每朵花的实时HP
      const flowersWithMemory = FlowerMemoryService.calculateMultipleFlowersHP(gardenFlowers);

      // 为每朵花添加记忆状态信息
      const enrichedFlowers = flowersWithMemory.map(flower => {
        const memoryStatus = FlowerMemoryService.getMemoryStatus(flower.calculatedHP, flower.maxHp);
        
        return {
          id: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          originalHP: flower.hp, // 数据库中存储的HP
          currentHP: flower.calculatedHP, // 根据遗忘曲线计算的当前HP
          maxHP: flower.maxHp,
          isPlanted: flower.isPlanted,
          gardenPosition: { x: flower.gardenPositionX, y: flower.gardenPositionY },
          plantedAt: flower.plantedAt,
          lastHealedAt: flower.lastHealedAt,
          memoryStatus: {
            level: memoryStatus.level,
            percentage: memoryStatus.percentage,
            description: memoryStatus.description,
            color: memoryStatus.color
          },
          // 预测未来24小时和7天的HP
          predictions: {
            in24Hours: FlowerMemoryService.predictFlowerHP(flower as any, 24),
            in7Days: FlowerMemoryService.predictFlowerHP(flower as any, 168)
          }
        };
      });

      // 计算花园整体记忆健康度
      const memoryHealth = FlowerMemoryService.calculateGardenMemoryHealth(gardenFlowers);

      logger.info(`用户 ${userId} 查询花园记忆状态: ${gardenFlowers.length}朵花，平均HP ${memoryHealth.averageHP}`);

      return res.status(200).json({
        success: true,
        message: '获取花园记忆状态成功',
        data: {
          flowers: enrichedFlowers,
          memoryHealth
        }
      });

    } catch (error) {
      logger.error('获取花园记忆状态失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取花园记忆状态失败'
      });
    }
  }

  /**
   * 获取单朵花的遗忘曲线数据
   */
  async getFlowerForgetCurve(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, flowerId } = req.params;
      const { durationHours = 168 } = req.query; // 默认7天

      if (!userId || !flowerId) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数'
        });
      }

      // 查找花朵
      const flower = await Flower.findOne({
        _id: new mongoose.Types.ObjectId(flowerId),
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (!flower) {
        return res.status(404).json({
          success: false,
          message: '花朵不存在'
        });
      }

      // 获取遗忘曲线数据
      const curveData = FlowerMemoryService.getForgetCurveData(flower, Number(durationHours));
      const currentHP = FlowerMemoryService.calculateFlowerHP(flower);
      const memoryStatus = FlowerMemoryService.getMemoryStatus(currentHP, flower.maxHp);

      return res.status(200).json({
        success: true,
        message: '获取遗忘曲线数据成功',
        data: {
          flower: {
            id: flower._id,
            subject: flower.subject,
            grade: flower.grade,
            category: flower.category,
            currentHP,
            maxHP: flower.maxHp,
            memoryStatus
          },
          curveData,
          recommendations: this.generateMemoryRecommendations(flower, currentHP)
        }
      });

    } catch (error) {
      logger.error('获取遗忘曲线数据失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取遗忘曲线数据失败'
      });
    }
  }

  /**
   * 生成记忆建议
   */
  private generateMemoryRecommendations(flower: any, currentHP: number): string[] {
    const recommendations: string[] = [];
    const hpPercentage = (currentHP / flower.maxHp) * 100;
    
    if (hpPercentage >= 90) {
      recommendations.push('🌟 记忆状态优秀！继续保持良好的学习习惯');
    } else if (hpPercentage >= 70) {
      recommendations.push('👍 记忆状态良好，建议定期复习巩固');
    } else if (hpPercentage >= 50) {
      recommendations.push('⚠️ 记忆开始衰减，建议增加复习频率');
      recommendations.push('💧 考虑使用甘露进行记忆强化');
    } else if (hpPercentage >= 30) {
      recommendations.push('🚨 记忆衰减严重，需要立即复习！');
      recommendations.push('💧 强烈建议使用甘露恢复记忆');
    } else {
      recommendations.push('🆘 濒临遗忘！请立即进行深度复习');
      recommendations.push('💧 必须使用甘露进行紧急治疗');
      recommendations.push('📚 建议重新学习相关内容');
    }
    
    // 根据学科给出具体建议
    switch (flower.subject) {
      case 'math':
        recommendations.push('🔢 数学需要大量练习，建议做题巩固');
        break;
      case 'english':
        recommendations.push('🗣️ 英语需要多听多说，建议语音练习');
        break;
      case 'chinese':
        recommendations.push('📖 语文需要多读多写，建议阅读练习');
        break;
    }
    
    return recommendations;
  }

  /**
   * 按学科分组花朵
   */
  private groupFlowersBySubject(flowers: any[]): Record<string, any> {
    return flowers.reduce((acc: any, flower) => {
      const subject = flower.subject;
      if (!acc[subject]) {
        acc[subject] = {
          total: 0,
          planted: 0,
          warehouse: 0,
          avgHP: 0
        };
      }
      acc[subject].total++;
      if (flower.isPlanted) {
        acc[subject].planted++;
      } else {
        acc[subject].warehouse++;
      }
      return acc;
    }, {});
  }

  /**
   * 按学科分组甘露
   */
  private groupNectarsBySubject(nectars: any[]): Record<string, any> {
    return nectars.reduce((acc: any, nectar) => {
      const subject = nectar.subject;
      if (!acc[subject]) {
        acc[subject] = {
          count: 0,
          totalHealingPower: 0
        };
      }
      acc[subject].count++;
      acc[subject].totalHealingPower += nectar.healingPower;
      return acc;
    }, {});
  }

  /**
   * 计算花园利用率
   */
  private calculateGardenUtilization(plantedCount: number): number {
    const maxCapacity = 80; // 10x8 网格
    return Math.round((plantedCount / maxCapacity) * 100);
  }

  /**
   * 获取各学科花朵状态信息
   * 根据用户年级、学科分类统计等计算花朵等级和HP
   */
  async getSubjectFlowerStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 1. 获取用户信息，特别是年级
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const userGrade = user.grade;
      const subjects = ['chinese', 'math', 'english']; // 主要学科

      const subjectFlowerData = [];

      for (const subject of subjects) {
        try {
          // 2. 查询该学科-年级下的所有分类问题，作为花的总等级
          const QuestionModel = createQuestionModel(subject, userGrade);
          
          // 获取该学科下所有分类的问题统计
          const categoryStats = await QuestionModel.aggregate([
            {
              $group: {
                _id: '$category',
                totalQuestions: { $sum: 1 },
                avgDifficulty: { $avg: '$difficulty_score' }
              }
            },
            {
              $project: {
                category: '$_id',
                totalQuestions: 1,
                avgDifficulty: { $round: ['$avgDifficulty', 1] }
              }
            }
          ]);

          // 计算总等级（所有分类的问题数之和）
          const totalLevel = categoryStats.reduce((sum, cat) => sum + cat.totalQuestions, 0);

          // 3. 查询当前用户在该学科下已获得的花朵，按分类统计
          const userFlowers = await Flower.find({
            userId: new mongoose.Types.ObjectId(userId),
            subject: subject
          });

          // 按分类统计用户已获得的花朵
          const userFlowersByCategory = userFlowers.reduce((acc: any, flower) => {
            if (!acc[flower.category]) {
              acc[flower.category] = [];
            }
            acc[flower.category].push(flower);
            return acc;
          }, {});

          // 计算当前等级（用户已获得的花朵数）
          const currentLevel = userFlowers.length;

          // 计算已闯关的分类数量（有花朵的分类就算已闯关）
          const completedCategoriesCount = Object.keys(userFlowersByCategory).length;
          
          // 计算总分类数量
          const totalCategoriesCount = categoryStats.length;
          
          // 计算花的体积比例：已闯关分类数 / 总分类数
          const volumeRatio = totalCategoriesCount > 0 ? completedCategoriesCount / totalCategoriesCount : 0;

          // 4. 查询用户的闯关记录，用于计算记忆遗忘曲线
          const userRecords = await TowerDefenseRecord.find({
            userId: new mongoose.Types.ObjectId(userId),
            subject: subject,
            grade: userGrade
          }).sort({ createdAt: -1 });

          // 按分类统计闯关记录
          const recordsByCategory = userRecords.reduce((acc: any, record) => {
            if (!acc[record.category]) {
              acc[record.category] = [];
            }
            acc[record.category].push(record);
            return acc;
          }, {});

          // 5. 计算各分类的待闯关和已闯关状态
          const categoryHPInfo: Array<{
            分类: string;
            hp值: number;
            最大hp值: number;
            上一次闯关时间?: Date | null;
            闯关次数: number;
            花朵数量: number;
            问题总数: number;
          }> = [];
          let totalCurrentHP = 0;
          let totalMaxHP = 0;

          categoryStats.forEach(categoryStat => {
            const category = categoryStat.category;
            const categoryFlowers = userFlowersByCategory[category] || [];
            const categoryRecords = recordsByCategory[category] || [];
            
            // 计算该分类的HP
            let categoryCurrentHP = 0;
            let categoryMaxHP = 0;
            let lastPlayTime = null;

            if (categoryFlowers.length > 0) {
              // 如果有花朵，计算记忆衰减后的HP
              categoryFlowers.forEach((flower: any) => {
                const calculatedHP = FlowerMemoryService.calculateFlowerHP(flower);
                categoryCurrentHP += calculatedHP;
                categoryMaxHP += flower.maxHp;
              });
              
              // 获取该分类的最后闯关时间
              if (categoryRecords.length > 0) {
                lastPlayTime = categoryRecords[0].createdAt;
              }
            }

            categoryHPInfo.push({
              分类: category,
              hp值: categoryCurrentHP,
              最大hp值: categoryMaxHP,
              上一次闯关时间: lastPlayTime,
              闯关次数: categoryRecords.length,
              花朵数量: categoryFlowers.length,
              问题总数: categoryStat.totalQuestions
            });

            totalCurrentHP += categoryCurrentHP;
            totalMaxHP += categoryMaxHP;
          });

          // 6. 分析待闯关和已闯关
          const completedCategories = categoryStats.filter(cat => 
            userFlowersByCategory[cat.category] && userFlowersByCategory[cat.category].length > 0
          );
          
          const pendingCategories = categoryStats.filter(cat => 
            !userFlowersByCategory[cat.category] || userFlowersByCategory[cat.category].length === 0
          );

          // 7. 组装返回数据
          subjectFlowerData.push({
            subject: subject,
            当前等级: currentLevel,
            总等级: totalLevel,
            已闯关分类数: completedCategoriesCount,
            总分类数: totalCategoriesCount,
            花的体积比例: volumeRatio,
            闯关完成度: Math.round(volumeRatio * 100),
            待闯关: pendingCategories.map(cat => ({
              分类: cat.category,
              问题数: cat.totalQuestions,
              平均难度: cat.avgDifficulty
            })),
            已闯关: completedCategories.map(cat => ({
              分类: cat.category,
              问题数: cat.totalQuestions,
              花朵数量: userFlowersByCategory[cat.category].length,
              闯关次数: (recordsByCategory[cat.category] || []).length,
              最后闯关时间: (recordsByCategory[cat.category] || [])[0]?.createdAt
            })),
            花的血量HP: {
              当前花总的HP: Math.round(totalCurrentHP),
              最大花总的HP: totalMaxHP,
              HP百分比: totalMaxHP > 0 ? Math.round((totalCurrentHP / totalMaxHP) * 100) : 0,
              category: categoryHPInfo
            }
          });

        } catch (subjectError) {
          logger.error(`处理学科 ${subject} 数据失败:`, subjectError);
          // 如果某个学科处理失败，继续处理其他学科
          subjectFlowerData.push({
            subject: subject,
            当前等级: 0,
            总等级: 0,
            已闯关分类数: 0,
            总分类数: 0,
            花的体积比例: 0,
            闯关完成度: 0,
            待闯关: [],
            已闯关: [],
            花的血量HP: {
              当前花总的HP: 0,
              最大花总的HP: 0,
              HP百分比: 0,
              category: []
            },
            error: '该学科数据处理失败'
          });
        }
      }

      logger.info(`用户 ${userId} 的学科花朵状态查询完成，涉及 ${subjects.length} 个学科`);

      return res.status(200).json({
        success: true,
        message: '获取学科花朵状态成功',
        data: {
          userId: userId,
          userGrade: userGrade,
          subjectFlowers: subjectFlowerData,
          summary: {
            totalSubjects: subjects.length,
            totalCurrentLevel: subjectFlowerData.reduce((sum, s) => sum + s.当前等级, 0),
            totalMaxLevel: subjectFlowerData.reduce((sum, s) => sum + s.总等级, 0),
            averageHPPercentage: Math.round(
              subjectFlowerData.reduce((sum, s) => sum + s.花的血量HP.HP百分比, 0) / subjects.length
            )
          }
        }
      });

    } catch (error) {
      logger.error('获取学科花朵状态失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取学科花朵状态失败'
      });
    }
  }

  /**
   * 获取用户的甘露库存
   */
  async getNectarInventory(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 获取用户所有甘露
      const nectars = await Nectar.find({ userId: new mongoose.Types.ObjectId(userId) });

      // 按学科分类统计甘露
      const nectarSummary = nectars.reduce((acc: any, nectar) => {
        const key = `${nectar.subject}-grade${nectar.grade}-${nectar.category}`;
        if (!acc[key]) {
          acc[key] = {
            id: nectar._id,
            subject: nectar.subject,
            grade: nectar.grade,
            category: nectar.category,
            totalHealingPower: 0,
            count: 0,
            nectarIds: []
          };
        }
        acc[key].totalHealingPower += nectar.healingPower;
        acc[key].count += 1;
        acc[key].nectarIds.push(nectar._id);
        return acc;
      }, {});

      logger.info(`用户 ${userId} 甘露库存查询: ${nectars.length}份甘露，${Object.keys(nectarSummary).length}种类型`);

      return res.status(200).json({
        success: true,
        message: '获取甘露库存成功',
        data: {
          nectars: Object.values(nectarSummary),
          totalNectars: nectars.length,
          totalTypes: Object.keys(nectarSummary).length
        }
      });

    } catch (error) {
      logger.error('获取甘露库存失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取甘露库存失败'
      });
    }
  }

  /**
   * 简化版甘露使用接口 - 使用甘露ID直接治疗花朵
   */
  async useNectar(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, flowerId, nectarId, healingAmount } = req.body;

      if (!userId || !flowerId || !nectarId) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数: userId, flowerId, nectarId'
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 查找花朵
        const flower = await Flower.findOne({
          _id: new mongoose.Types.ObjectId(flowerId),
          userId: new mongoose.Types.ObjectId(userId)
        }).session(session);

        if (!flower) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            success: false,
            message: '花朵不存在'
          });
        }

        // 查找甘露
        const nectar = await Nectar.findOne({
          _id: new mongoose.Types.ObjectId(nectarId),
          userId: new mongoose.Types.ObjectId(userId)
        }).session(session);

        if (!nectar) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({
            success: false,
            message: '甘露不存在'
          });
        }

        // 计算实际治疗量
        const maxHealingAmount = healingAmount || nectar.healingPower;
        const actualHealing = Math.min(
          maxHealingAmount,
          flower.maxHp - flower.hp,
          nectar.healingPower
        );
        
        if (actualHealing <= 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: '花朵已满血或甘露不足'
          });
        }

        // 治疗花朵
        flower.hp = Math.min(flower.hp + actualHealing, flower.maxHp);
        flower.lastHealedAt = new Date();
        await flower.save({ session });

        // 消耗甘露
        nectar.healingPower -= actualHealing;
        if (nectar.healingPower <= 0) {
          await Nectar.deleteOne({ _id: nectar._id }).session(session);
        } else {
          await nectar.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        logger.info(`用户 ${userId} 使用甘露 ${nectarId} 治疗花朵 ${flowerId}，恢复 ${actualHealing} HP`);

        return res.status(200).json({
          success: true,
          message: '甘露使用成功',
          data: {
            flower: {
              id: flower._id,
              subject: flower.subject,
              grade: flower.grade,
              category: flower.category,
              hp: flower.hp,
              maxHp: flower.maxHp,
              isPlanted: flower.isPlanted,
              gardenPosition: flower.isPlanted ? { x: flower.gardenPositionX, y: flower.gardenPositionY } : null,
              plantedAt: flower.plantedAt,
              lastHealedAt: flower.lastHealedAt
            },
            healedAmount: actualHealing,
            remainingNectar: nectar.healingPower > 0 ? nectar.healingPower : 0,
            nectarConsumed: nectar.healingPower <= 0
          }
        });

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }

    } catch (error) {
      logger.error('使用甘露失败:', error);
      return res.status(500).json({
        success: false,
        message: '使用甘露失败'
      });
    }
  }
} 
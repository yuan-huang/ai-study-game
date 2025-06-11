import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Document } from 'mongoose';
import { logger } from '../utils/logger';
import { FlowerModel } from '../models/Flower';
import { Nectar } from '../models/Nectar';
import { User } from '../models/User';
import { FlowerMemoryService } from '../services/FlowerMemoryService';
import { GardenService } from '../services/GardenService';
import { FlowerBloodManager } from '../services/FlowerBloodManager';
import { TowerDefenseRecordModel } from '../models/TowerDefenseRecord';
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
      const flower = await FlowerModel.findOne({
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
      const existingFlower = await FlowerModel.findOne({
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
      const flower = await FlowerModel.findOne({
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
      const flower = await FlowerModel.findOne({
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
      const existingFlower = await FlowerModel.findOne({
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
        const flower = await FlowerModel.findOne({
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

      const plantedFlowers = await FlowerModel.find({
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

      const warehouseFlowers = await FlowerModel.find({
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
      const userId = req.user.userId;

      // 获取所有花朵（从塔防奖励中获得）
      const flowers = await FlowerModel.find({ userId: new mongoose.Types.ObjectId(userId) });
      
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
          const flower = await FlowerModel.findOne({
            _id: new mongoose.Types.ObjectId(flowerId),
            userId: new mongoose.Types.ObjectId(userId),
            isPlanted: false
          }).session(session);

          if (!flower) {
            continue; // 跳过不存在或已种植的花朵
          }

          // 检查位置是否被占用
          const existingFlower = await FlowerModel.findOne({
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
      const flower = await FlowerModel.findOne({
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
      const occupiedPositions = await FlowerModel.find({
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
      const gardenFlowers = await FlowerModel.find({
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
      const flower = await FlowerModel.findOne({
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
   * 🌟 优化：使用虚拟血量计算，不强制更新数据库
   */
  async getSubjectFlowerStatus(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user.userId;
      const { forceUpdate = false } = req.query; // 可选参数：是否强制更新数据库血量

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 🌟 优化：只有明确要求或满足24小时条件时才更新数据库血量
      if (forceUpdate === 'true' || await this.shouldUpdateFlowerHP(userId)) {
        logger.info(`为用户 ${userId} 更新花朵血量 (forceUpdate=${forceUpdate})`);
        await GardenService.updateAllFlowersHP(userId);
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
          const userFlowers = await FlowerModel.find({
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
          const userRecords = await TowerDefenseRecordModel.find({
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

          // 5. 🌟 使用虚拟血量计算，不修改数据库
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

          // 按分类统计HP信息
          categoryStats.forEach(categoryStat => {
            const category = categoryStat.category;
            const categoryFlowers = userFlowersByCategory[category] || [];
            const categoryRecords = recordsByCategory[category] || [];
            
            // 计算该分类的HP
            let categoryCurrentHP = 0;
            let categoryMaxHP = 0;
            let lastPlayTime = null;

            if (categoryFlowers.length > 0) {
              // 🌟 简化：只计算数据库HP
              categoryFlowers.forEach((flower: any) => {
                categoryCurrentHP += flower.hp; // 数据库存储的HP
                categoryMaxHP += flower.maxHp;
              });
              
              // 获取该分类的最后闯关时间
              if (categoryRecords.length > 0) {
                lastPlayTime = categoryRecords[0].createdAt;
              }
            }

            totalCurrentHP += categoryCurrentHP;
            totalMaxHP += categoryMaxHP;

            categoryHPInfo.push({
              分类: category,
              hp值: Math.round(categoryCurrentHP), // 数据库HP
              最大hp值: categoryMaxHP,
              上一次闯关时间: lastPlayTime,
              闯关次数: categoryRecords.length,
              花朵数量: categoryFlowers.length,
              问题总数: categoryStat.totalQuestions
            });
          });

          logger.info(`学科${subject}血量统计: 总HP=${Math.round(totalCurrentHP)}, 最大HP=${totalMaxHP}`);

          // 6. 分析待闯关和已闯关
          const completedCategories = categoryStats.filter(cat => 
            userFlowersByCategory[cat.category] && userFlowersByCategory[cat.category].length > 0
          );
          
          const pendingCategories = categoryStats.filter(cat => 
            !userFlowersByCategory[cat.category] || userFlowersByCategory[cat.category].length === 0
          );

          // 7. 🌟 简化：组装返回数据（使用数据库血量）
          const displayHP = totalCurrentHP;
          
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
              当前花总的HP: Math.round(displayHP),
              最大花总的HP: totalMaxHP,
              HP百分比: totalMaxHP > 0 ? Math.round((displayHP / totalMaxHP) * 100) : 0,
              血量来源: '数据库',
              计算说明: '使用数据库存储的血量',
              血量详情: {
                学科花朵总数: userFlowers.length,
                有花朵的分类数: Object.keys(userFlowersByCategory).length,
                更新建议: '24小时自动衰减机制'
              },
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
              数据库HP: 0,
              虚拟HP: 0,
              最大花总的HP: 0,
              HP百分比: 0,
              血量来源: '错误',
              category: []
            },
            error: '该学科数据处理失败'
          });
        }
      }

      logger.info(`用户 ${userId} 的学科花朵状态查询完成（虚拟血量模式），涉及 ${subjects.length} 个学科`);

      return res.status(200).json({
        success: true,
        message: '获取学科花朵状态成功',
        data: {
          userId: userId,
          userGrade: userGrade,
          bloodCalculationMode: '数据库血量', // 标识使用的血量计算模式
          subjectFlowers: subjectFlowerData,
          summary: {
            totalSubjects: subjects.length,
            totalCurrentLevel: subjectFlowerData.reduce((sum, s) => sum + s.当前等级, 0),
            totalMaxLevel: subjectFlowerData.reduce((sum, s) => sum + s.总等级, 0),
            averageHPPercentage: Math.round(
              subjectFlowerData.reduce((sum, s) => sum + s.花的血量HP.HP百分比, 0) / subjects.length
            )
          },
          操作提示: {
            查看血量: '当前返回数据库存储的血量',
            强制更新数据库: '添加参数 ?forceUpdate=true 可强制更新数据库血量',
            自动更新条件: '系统会在超过24小时时自动更新数据库'
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
   * 🌟 重新设计：判断是否需要更新花朵血量到数据库
   * 核心规则：只有超过24小时才能更新血量
   * @param userId 用户ID
   * @returns 是否需要更新
   */
  private async shouldUpdateFlowerHP(userId: string): Promise<boolean> {
    try {
      const updateDecision = await FlowerBloodManager.shouldUpdateFlowers(userId);
      
      if (updateDecision.shouldUpdate) {
        logger.info(`用户 ${userId} 满足24小时更新条件: ${updateDecision.reason} (优先级: ${updateDecision.priority})`);
      } else {
        logger.info(`用户 ${userId} 暂无花朵满足24小时更新条件`);
      }

      return updateDecision.shouldUpdate;

    } catch (error) {
      logger.error('判断血量更新条件失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的甘露库存
   */
  async getNectarInventory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user.userId;


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
   * 手动更新花朵血量并输出扣血日志
   * 用于演示和测试遗忘曲线功能
   */
  async updateFlowersBloodAndShowLog(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      logger.info(`=== 开始为用户 ${userId} 演示花朵扣血功能 ===`);

      // 1. 更新花朵血量
      await GardenService.updateAllFlowersHP(userId);

      // 2. 输出详细的扣血预测表
      await GardenService.outputFlowerBloodLossSchedule(userId);

      // 3. 获取更新后的花朵数据用于返回
      const updatedFlowers = await FlowerModel.find({
        userId: new mongoose.Types.ObjectId(userId)
      });

      const flowersWithMemory = updatedFlowers.map(flower => {
        const currentHP = flower.hp; // 直接使用已更新的血量
        const memoryStatus = FlowerMemoryService.getMemoryStatus(currentHP, flower.maxHp);
        
        return {
          id: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          currentHP: currentHP,
          maxHP: flower.maxHp,
          isPlanted: flower.isPlanted,
          plantedAt: flower.plantedAt,
          lastHealedAt: flower.lastHealedAt,
          lastUpdatedAt: flower.lastUpdatedAt,
          memoryStatus: {
            level: memoryStatus.level,
            percentage: memoryStatus.percentage,
            description: memoryStatus.description,
            color: memoryStatus.color
          }
        };
      });

      logger.info(`=== 用户 ${userId} 花朵扣血演示完成 ===`);

      return res.status(200).json({
        success: true,
        message: '花朵血量更新和扣血日志生成完成',
        data: {
          totalFlowers: updatedFlowers.length,
          flowers: flowersWithMemory,
          note: '详细的扣血日志已输出到服务器日志中，包括未来7天的预测表'
        }
      });

    } catch (error) {
      logger.error('更新花朵血量并输出日志失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新花朵血量并输出日志失败'
      });
    }
  }

  /**
   * 使用甘露治疗对应学科分类的所有花朵
   * 新逻辑：直接恢复100HP，清空甘露，重新计算生命值
   */
  async useNectar(req: Request, res: Response): Promise<Response> {
    try {
      const { subject, category } = req.body;

      if (!subject || !category) {
        return res.status(400).json({
          success: false,
          message: '缺少必需参数: userId, subject, category'
        });
      }

      const userId = req.user.userId;

      // 获取用户信息，获取年级
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const userGrade = user.grade;

      try {
        // 1. 查找对应学科-年级-分类的所有甘露
        const nectars = await Nectar.find({
          userId: new mongoose.Types.ObjectId(userId),
          subject: subject,
          grade: userGrade,
          category: category
        });

        if (nectars.length === 0) {
          return res.status(404).json({
            success: false,
            message: '没有找到对应的甘露'
          });
        }

        // 2. 查找对应学科-年级-分类的所有花朵
        const flowers = await FlowerModel.find({
          userId: new mongoose.Types.ObjectId(userId),
          subject: subject,
          grade: userGrade,
          category: category
        });

        if (flowers.length === 0) {
          return res.status(404).json({
            success: false,
            message: '没有找到对应的花朵'
          });
        }

        // 3. 🌟 新逻辑：直接将对应的花血量恢复到100HP
        const healedFlowers = [];
        for (const flower of flowers) {
          const beforeHP = flower.hp;
          
          // 直接设置为100HP（满血）
          flower.hp = 100;
          flower.lastHealedAt = new Date();
          await flower.save();

          healedFlowers.push({
            id: flower._id,
            subject: flower.subject,
            grade: flower.grade,
            category: flower.category,
            beforeHP: beforeHP,
            afterHP: flower.hp,
            healedAmount: flower.hp - beforeHP,
            maxHp: flower.maxHp
          });

          logger.info(`花朵 ${flower._id} 从 ${beforeHP}HP 直接恢复到 ${flower.hp}HP`);
        }

        // 4. 🌟 将当前甘露匹配的属性全部清空掉
        const deletedNectarsCount = await Nectar.deleteMany({
          userId: new mongoose.Types.ObjectId(userId),
          subject: subject,
          grade: userGrade,
          category: category
        });


        // 输出使用甘露后的最终状态
        logger.info('=== 甘露使用完成 ===');
        logger.info(`用户: ${userId}`);
        logger.info(`学科-年级-分类: ${subject}-${userGrade}-${category}`);
        logger.info(`治疗花朵数: ${healedFlowers.length}`);
        logger.info(`消耗甘露数: ${deletedNectarsCount.deletedCount}`);
        logger.info(`处理步骤: 1.直接恢复100HP → 2.清空甘露 → 3.重新计算生命值`);
        
        logger.info(`用户 ${userId} 使用 ${subject}-${userGrade}-${category} 甘露成功，治疗了 ${healedFlowers.length} 朵花，清空了 ${deletedNectarsCount.deletedCount} 份甘露`);

        return res.status(200).json({
          success: true,
          message: `甘露使用成功，${healedFlowers.length} 朵花朵恢复到满血状态`,
          data: {
            subject,
            grade: userGrade,
            category,
            healedFlowersCount: healedFlowers.length,
            deletedNectarsCount: deletedNectarsCount.deletedCount,
            healedFlowers,
            note: '所有花朵已恢复到100HP，甘露已清空，生命值已重新计算'
          }
        });

      } catch (error) {
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

  /**
   * 手动更新花朵血量
   * 提供独立的血量更新接口，用于手动触发或定时任务
   */
  async updateFlowersBlood(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { outputLog = false } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      logger.info(`手动更新用户 ${userId} 的花朵血量`);

      // 获取更新前的花朵状态
      const beforeFlowers = await FlowerModel.find({
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (beforeFlowers.length === 0) {
        return res.status(200).json({
          success: true,
          message: '用户暂无花朵，无需更新',
          data: {
            totalFlowers: 0,
            updatedFlowers: 0,
            updateDetails: []
          }
        });
      }

      // 执行血量更新
      await GardenService.updateAllFlowersHP(userId);

      // 如果需要输出详细日志
      if (outputLog === 'true') {
        await GardenService.outputFlowerBloodLossSchedule(userId);
      }

      // 获取更新后的花朵状态
      const afterFlowers = await FlowerModel.find({
        userId: new mongoose.Types.ObjectId(userId)
      });

      // 计算更新详情
      const updateDetails = beforeFlowers.map((beforeFlower, index) => {
        const afterFlower = afterFlowers.find(f => f._id.toString() === beforeFlower._id.toString());
        const hpLoss = beforeFlower.hp - (afterFlower?.hp || 0);
        const virtualHP = FlowerMemoryService.calculateFlowerHP(beforeFlower);

        return {
          flowerId: beforeFlower._id,
          subject: beforeFlower.subject,
          grade: beforeFlower.grade,
          category: beforeFlower.category,
          beforeHP: beforeFlower.hp,
          afterHP: afterFlower?.hp || 0,
          hpLoss: hpLoss,
          virtualHP: Math.round(virtualHP),
          hpLossPercentage: beforeFlower.maxHp > 0 ? Math.round((hpLoss / beforeFlower.maxHp) * 100) : 0,
          maxHp: beforeFlower.maxHp,
          updateTime: new Date()
        };
      });

      const totalHPLoss = updateDetails.reduce((sum, detail) => sum + detail.hpLoss, 0);
      const avgHPLoss = updateDetails.length > 0 ? totalHPLoss / updateDetails.length : 0;

      logger.info(`用户 ${userId} 血量更新完成: 总扣血${totalHPLoss}HP，平均扣血${avgHPLoss.toFixed(1)}HP`);

      return res.status(200).json({
        success: true,
        message: `花朵血量更新完成，共更新 ${updateDetails.length} 朵花`,
        data: {
          totalFlowers: updateDetails.length,
          updatedFlowers: updateDetails.filter(d => d.hpLoss > 0).length,
          totalHPLoss,
          averageHPLoss: Math.round(avgHPLoss * 100) / 100,
          updateDetails,
          statistics: {
            criticalFlowers: updateDetails.filter(d => (d.afterHP / d.maxHp) < 0.3).length,
            healthyFlowers: updateDetails.filter(d => (d.afterHP / d.maxHp) >= 0.7).length,
            updateTime: new Date()
          }
        }
      });

    } catch (error) {
      logger.error('手动更新花朵血量失败:', error);
      return res.status(500).json({
        success: false,
        message: '手动更新花朵血量失败'
      });
    }
  }

  /**
   * 获取花朵血量状态对比
   * 对比数据库血量与虚拟血量，不更新数据库
   */
  async getFlowersBloodComparison(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      const flowers = await FlowerModel.find({
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (flowers.length === 0) {
        return res.status(200).json({
          success: true,
          message: '用户暂无花朵',
          data: {
            totalFlowers: 0,
            comparison: []
          }
        });
      }

      const currentTime = new Date();
      const comparison = flowers.map(flower => {
        const virtualHP = FlowerMemoryService.calculateFlowerHP(flower, currentTime);
        const hpDifference = virtualHP - flower.hp;
        const memoryStatus = FlowerMemoryService.getMemoryStatus(virtualHP, flower.maxHp);
        const forgettingInfo = FlowerMemoryService.calculateForgettingRate(flower, currentTime);

        return {
          flowerId: flower._id,
          subject: flower.subject,
          grade: flower.grade,
          category: flower.category,
          databaseHP: flower.hp,
          virtualHP: Math.round(virtualHP),
          hpDifference: Math.round(hpDifference),
          hpDifferencePercentage: Math.round((hpDifference / flower.maxHp) * 100),
          maxHP: flower.maxHp,
          memoryStatus,
          forgettingInfo,
          lastUpdated: flower.lastUpdatedAt,
          needsUpdate: Math.abs(hpDifference) > 10,
          updatePriority: Math.abs(hpDifference) > 20 ? 'high' : Math.abs(hpDifference) > 10 ? 'medium' : 'low'
        };
      });

      // 统计信息
      const totalDatabaseHP = flowers.reduce((sum, f) => sum + f.hp, 0);
      const totalVirtualHP = comparison.reduce((sum, c) => sum + c.virtualHP, 0);
      const needsUpdateCount = comparison.filter(c => c.needsUpdate).length;
      const highPriorityCount = comparison.filter(c => c.updatePriority === 'high').length;

      return res.status(200).json({
        success: true,
        message: '获取花朵血量对比成功',
        data: {
          totalFlowers: flowers.length,
          comparison,
          statistics: {
            totalDatabaseHP,
            totalVirtualHP,
            totalHPDifference: totalVirtualHP - totalDatabaseHP,
            hpDifferencePercentage: totalDatabaseHP > 0 ? Math.round(((totalVirtualHP - totalDatabaseHP) / totalDatabaseHP) * 100) : 0,
            needsUpdateCount,
            highPriorityCount,
            syncStatus: Math.abs(totalVirtualHP - totalDatabaseHP) < 50 ? 'good' : 'needs_update',
            recommendation: Math.abs(totalVirtualHP - totalDatabaseHP) > 100 ? '建议立即更新血量' : '血量同步正常'
          }
        }
      });

    } catch (error) {
      logger.error('获取花朵血量对比失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取花朵血量对比失败'
      });
    }
  }

  /**
   * 🌟 获取优化的花朵血量状态
   * 使用虚拟血量计算，提供详细的同步状态信息
   */
  async getOptimizedFlowersBloodStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { useCache = true } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      const flowers = await FlowerModel.find({
        userId: new mongoose.Types.ObjectId(userId)
      });

      if (flowers.length === 0) {
        return res.status(200).json({
          success: true,
          message: '用户暂无花朵',
          data: {
            flowers: [],
            summary: {
              totalFlowers: 0,
              totalDatabaseHP: 0,
              totalVirtualHP: 0,
              totalHPDifference: 0,
              needsUpdateCount: 0,
              averageUpdateAge: 0,
              syncStatus: 'excellent'
            },
            updateDecision: {
              shouldUpdate: false,
              reason: '无花朵',
              priority: 'low',
              affectedFlowers: 0,
              recommendations: []
            }
          }
        });
      }

      // 获取血量状态
      const bloodStatus = await FlowerBloodManager.getFlowersBloodStatus(flowers);
      
      // 获取更新建议
      const updateDecision = await FlowerBloodManager.shouldUpdateFlowers(userId);
      
      // 获取详细建议
      const recommendations = await FlowerBloodManager.getUpdateRecommendations(userId);

      // 🌟 简化：花朵数据，只返回需要的字段
      const simplifiedFlowers = bloodStatus.flowers.map(f => ({
        id: f.flower._id,
        subject: f.flower.subject,
        grade: f.flower.grade,
        category: f.flower.category,
        databaseHP: f.databaseHP,
        maxHP: f.flower.maxHp,
        memoryStatus: f.memoryStatus,
        needsUpdate: f.needsUpdate,
        updatePriority: f.updatePriority,
        hoursSinceLatest: f.hoursSinceLatest,
        isPlanted: f.flower.isPlanted,
        lastUpdated: f.flower.lastUpdatedAt,
        plantedAt: f.flower.plantedAt
      }));

      logger.info(`用户 ${userId} 血量状态查询: ${flowers.length}朵花，${bloodStatus.summary.needsUpdateCount}朵需要更新`);

      return res.status(200).json({
        success: true,
        message: '获取血量状态成功',
        data: {
          flowers: simplifiedFlowers,
          summary: bloodStatus.summary,
          updateDecision,
          recommendations,
          metadata: {
            calculationMode: '数据库血量',
            queryTime: new Date(),
            updateRule: '24小时自动衰减机制'
          }
        }
      });

    } catch (error) {
      logger.error('获取优化血量状态失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取优化血量状态失败'
      });
    }
  }

  /**
   * 🌟 智能更新花朵血量
   * 使用优化的更新策略
   */
  async smartUpdateFlowersBlood(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { 
        forceUpdate = false,
        maxFlowers,
        priorityOnly = false,
        batchSize
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 执行智能更新
      const updateResult = await FlowerBloodManager.smartUpdateFlowers(userId, {
        forceUpdate,
        maxFlowers,
        priorityOnly,
        batchSize
      });

      const message = updateResult.updatedCount > 0 
        ? `智能更新完成，更新了 ${updateResult.updatedCount}/${updateResult.totalFlowers} 朵花`
        : '所有花朵血量已同步，无需更新';

      logger.info(`用户 ${userId} ${message}`);

      return res.status(200).json({
        success: true,
        message,
        data: updateResult
      });

    } catch (error) {
      logger.error('智能更新花朵血量失败:', error);
      return res.status(500).json({
        success: false,
        message: '智能更新花朵血量失败'
      });
    }
  }

  /**
   * 批量更新特定条件的花朵血量
   * 可以按学科、血量差异等条件筛选更新
   */
  async batchUpdateFlowersBlood(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { 
        subject, 
        minHpDifference = 10, 
        onlyOutdated = false,
        maxAge = 24 
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户ID参数'
        });
      }

      // 构建查询条件
      const query: any = {
        userId: new mongoose.Types.ObjectId(userId)
      };

      if (subject) {
        query.subject = subject;
      }

      const flowers = await FlowerModel.find(query);

      if (flowers.length === 0) {
        return res.status(200).json({
          success: true,
          message: '未找到符合条件的花朵',
          data: {
            totalFlowers: 0,
            updatedFlowers: 0
          }
        });
      }

      const currentTime = new Date();
      const flowersToUpdate = [];

      // 筛选需要更新的花朵
      for (const flower of flowers) {
        const virtualHP = FlowerMemoryService.calculateFlowerHP(flower, currentTime);
        const hpDifference = Math.abs(virtualHP - flower.hp);
        
        // 检查时间条件
        const lastUpdateTime = flower.lastUpdatedAt || flower.createdAt;
        const hoursSinceUpdate = (currentTime.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);
        
        // 判断是否需要更新
        const needsUpdate = 
          hpDifference >= minHpDifference && 
          (!onlyOutdated || hoursSinceUpdate >= maxAge);

        if (needsUpdate) {
          flowersToUpdate.push({
            flower,
            virtualHP,
            hpDifference,
            hoursSinceUpdate
          });
        }
      }

      if (flowersToUpdate.length === 0) {
        return res.status(200).json({
          success: true,
          message: '没有花朵需要更新',
          data: {
            totalFlowers: flowers.length,
            updatedFlowers: 0,
            criteria: {
              subject: subject || 'all',
              minHpDifference,
              onlyOutdated,
              maxAge
            }
          }
        });
      }

      // 执行批量更新
      const updatePromises = flowersToUpdate.map(async ({ flower }) => {
        const virtualHP = FlowerMemoryService.calculateFlowerHP(flower, currentTime);
        const beforeHP = flower.hp;
        
        flower.hp = Math.max(0, Math.round(virtualHP));
        flower.lastUpdatedAt = currentTime;
        await flower.save();

        return {
          flowerId: flower._id,
          subject: flower.subject,
          category: flower.category,
          beforeHP,
          afterHP: flower.hp,
          hpChange: flower.hp - beforeHP
        };
      });

      const updateResults = await Promise.all(updatePromises);

      logger.info(`用户 ${userId} 批量更新花朵血量: 更新了 ${updateResults.length}/${flowers.length} 朵花`);

      return res.status(200).json({
        success: true,
        message: `批量更新完成，共更新 ${updateResults.length} 朵花`,
        data: {
          totalFlowers: flowers.length,
          updatedFlowers: updateResults.length,
          criteria: {
            subject: subject || 'all',
            minHpDifference,
            onlyOutdated,
            maxAge
          },
          updateResults,
          statistics: {
            totalHPChange: updateResults.reduce((sum, r) => sum + r.hpChange, 0),
            averageHPChange: updateResults.length > 0 ? 
              updateResults.reduce((sum, r) => sum + r.hpChange, 0) / updateResults.length : 0
          }
        }
      });

    } catch (error) {
      logger.error('批量更新花朵血量失败:', error);
      return res.status(500).json({
        success: false,
        message: '批量更新花朵血量失败'
      });
    }
  }
} 
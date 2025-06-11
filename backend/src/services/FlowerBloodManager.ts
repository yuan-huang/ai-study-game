import { IFlower, FlowerModel } from '../models/Flower';
import { FlowerMemoryService } from './FlowerMemoryService';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * 花朵血量管理器
 * 🌟 简化版：移除虚拟血量设计，只使用数据库血量
 */
export class FlowerBloodManager {

  /**
   * 血量更新策略配置
   */
  private static readonly UPDATE_STRATEGY = {
    // 自动更新条件
    AUTO_UPDATE_CONDITIONS: {
      REQUIRED_UPDATE_INTERVAL_HOURS: 24,  // 🌟 必须超过24小时才能更新血量
      CRITICAL_HP_THRESHOLD: 0.2           // 血量低于20%时优先更新（但仍需满足时间条件）
    },

    // 批量更新配置
    BATCH_UPDATE: {
      MAX_BATCH_SIZE: 50,                  // 每批次最大更新数量
      UPDATE_INTERVAL_MS: 100              // 批次间隔时间（毫秒）
    }
  };

  /**
   * 🌟 获取花朵的最新时间戳（创建时间、更新时间、血量更新时间中的最大值）
   * @param flower 花朵对象
   * @returns 最新时间戳
   */
  private static getLatestTimestamp(flower: IFlower): Date {
    const timestamps = [
      flower.createdAt,
      flower.updatedAt,
      flower.lastUpdatedAt,
      flower.lastHealedAt,
      flower.plantedAt
    ].filter(Boolean); // 过滤掉 null/undefined

    // 返回最新的时间戳
    return new Date(Math.max(...timestamps.map(date => date!.getTime())));
  }

  /**
   * 🌟 简化：获取花朵的当前血量状态（仅使用数据库血量）
   * @param flowers 花朵数组
   * @returns 血量状态信息
   */
  static async getFlowersBloodStatus(
    flowers: IFlower[]
  ): Promise<{
    flowers: Array<{
      flower: IFlower;
      databaseHP: number;
      memoryStatus: any;
      needsUpdate: boolean;
      updatePriority: 'low' | 'medium' | 'high' | 'critical';
      hoursSinceLatest: number;
    }>;
    summary: {
      totalFlowers: number;
      totalDatabaseHP: number;
      needsUpdateCount: number;
      averageUpdateAge: number;
      criticalFlowersCount: number;
    };
  }> {
    const currentTime = new Date();
    const flowerStatuses = [];

    let totalDatabaseHP = 0;
    let needsUpdateCount = 0;
    let totalUpdateAge = 0;
    let criticalFlowersCount = 0;

    for (const flower of flowers) {
      const databaseHP = flower.hp;

      // 获取记忆状态（基于数据库血量）
      const memoryStatus = FlowerMemoryService.getMemoryStatus(databaseHP, flower.maxHp);

      // 计算最新时间戳距离现在的小时数
      const latestTimestamp = this.getLatestTimestamp(flower);
      const hoursSinceLatest = (currentTime.getTime() - latestTimestamp.getTime()) / (1000 * 60 * 60);

      // 判断更新优先级（基于24小时规则和数据库血量）
      const updatePriority = this.calculateUpdatePriority(flower, databaseHP, currentTime);
      const needsUpdate = updatePriority !== 'low';

      // 检查是否是危险血量
      const hpPercentage = flower.maxHp > 0 ? (databaseHP / flower.maxHp) : 0;
      if (hpPercentage < this.UPDATE_STRATEGY.AUTO_UPDATE_CONDITIONS.CRITICAL_HP_THRESHOLD) {
        criticalFlowersCount++;
      }

      flowerStatuses.push({
        flower,
        databaseHP,
        memoryStatus,
        needsUpdate,
        updatePriority,
        hoursSinceLatest: Math.round(hoursSinceLatest * 10) / 10
      });

      totalDatabaseHP += databaseHP;
      if (needsUpdate) needsUpdateCount++;
      totalUpdateAge += hoursSinceLatest;
    }

    const averageUpdateAge = flowers.length > 0 ? totalUpdateAge / flowers.length : 0;

    return {
      flowers: flowerStatuses,
      summary: {
        totalFlowers: flowers.length,
        totalDatabaseHP: Math.round(totalDatabaseHP),
        needsUpdateCount,
        averageUpdateAge: Math.round(averageUpdateAge * 10) / 10,
        criticalFlowersCount
      }
    };
  }

  /**
   * 🌟 重新设计：判断是否需要更新花朵血量
   * 核心规则：只有超过24小时才能更新血量
   * @param userId 用户ID
   * @returns 更新决策信息
   */
  static async shouldUpdateFlowers(userId: string): Promise<{
    shouldUpdate: boolean;
    reason: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    affectedFlowers: number;
    recommendations: string[];
  }> {
    try {
      const flowers = await FlowerModel.find({ 
        userId: new mongoose.Types.ObjectId(userId) 
      });

      if (flowers.length === 0) {
        return {
          shouldUpdate: false,
          reason: '用户无花朵',
          priority: 'low',
          affectedFlowers: 0,
          recommendations: []
        };
      }

      const currentTime = new Date();
      const conditions = this.UPDATE_STRATEGY.AUTO_UPDATE_CONDITIONS;
      const reasons: string[] = [];
      const recommendations: string[] = [];

      let eligibleFlowers = 0;
      let criticalFlowers = 0;
      let maxPriority: 'low' | 'medium' | 'high' | 'critical' = 'low';

      // 🌟 核心逻辑：检查每朵花是否满足24小时更新条件
      for (const flower of flowers) {
        const latestTimestamp = this.getLatestTimestamp(flower);
        const hoursSinceLatest = (currentTime.getTime() - latestTimestamp.getTime()) / (1000 * 60 * 60);

        // 只有超过24小时的花朵才能被更新
        if (hoursSinceLatest >= conditions.REQUIRED_UPDATE_INTERVAL_HOURS) {
          eligibleFlowers++;

          // 🌟 简化：基于数据库血量检查是否是危险血量
          const hpPercentage = flower.maxHp > 0 ? (flower.hp / flower.maxHp) : 0;
          
          if (hpPercentage < conditions.CRITICAL_HP_THRESHOLD) {
            criticalFlowers++;
          }
        }
      }

      // 决定更新优先级和原因
      if (eligibleFlowers > 0) {
        reasons.push(`${eligibleFlowers}朵花已超过24小时未更新`);
        
        if (criticalFlowers > 0) {
          reasons.push(`其中${criticalFlowers}朵花处于危险血量`);
          maxPriority = 'critical';
          recommendations.push('🚨 有花朵血量危险，需要紧急更新');
          recommendations.push('💧 考虑使用甘露治疗危险花朵');
        } else {
          maxPriority = 'medium';
          recommendations.push('📊 建议更新符合条件的花朵血量');
        }
      }

      const shouldUpdate = eligibleFlowers > 0;

      if (shouldUpdate) {
        logger.info(`用户 ${userId} 血量更新检查: ${reasons.join(', ')}`);
      } else {
        logger.info(`用户 ${userId} 暂无花朵满足24小时更新条件`);
      }

      return {
        shouldUpdate,
        reason: reasons.join(', ') || '暂无花朵满足24小时更新条件',
        priority: maxPriority,
        affectedFlowers: eligibleFlowers,
        recommendations
      };

    } catch (error) {
      logger.error('判断血量更新条件失败:', error);
      return {
        shouldUpdate: false,
        reason: '检查失败',
        priority: 'low',
        affectedFlowers: 0,
        recommendations: ['检查更新条件时出错，请稍后重试']
      };
    }
  }

  /**
   * 智能更新花朵血量
   * 根据优先级和条件选择性更新
   * @param userId 用户ID
   * @param options 更新选项
   */
  static async smartUpdateFlowers(
    userId: string,
    options: {
      forceUpdate?: boolean;
      maxFlowers?: number;
      priorityOnly?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    success: boolean;
    updatedCount: number;
    totalFlowers: number;
    updateDetails: Array<{
      flowerId: string;
      subject: string;
      beforeHP: number;
      afterHP: number;
      hpChange: number;
      priority: string;
    }>;
    statistics: {
      totalHPChange: number;
      averageHPChange: number;
      updateDuration: number;
    };
  }> {
    const startTime = Date.now();
    
    try {
      const flowers = await FlowerModel.find({ 
        userId: new mongoose.Types.ObjectId(userId) 
      });

      if (flowers.length === 0) {
        return {
          success: true,
          updatedCount: 0,
          totalFlowers: 0,
          updateDetails: [],
          statistics: {
            totalHPChange: 0,
            averageHPChange: 0,
            updateDuration: 0
          }
        };
      }

      // 获取血量状态
      const bloodStatus = await this.getFlowersBloodStatus(flowers);

      // 筛选需要更新的花朵
      let flowersToUpdate = bloodStatus.flowers;

      if (!options.forceUpdate) {
        // 根据优先级筛选
        if (options.priorityOnly) {
          flowersToUpdate = flowersToUpdate.filter(f => 
            ['high', 'critical'].includes(f.updatePriority)
          );
        } else {
          flowersToUpdate = flowersToUpdate.filter(f => f.needsUpdate);
        }
      }

      // 限制更新数量
      if (options.maxFlowers && flowersToUpdate.length > options.maxFlowers) {
        // 按优先级排序，高优先级优先更新
        flowersToUpdate.sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.updatePriority] - priorityOrder[a.updatePriority];
        });
        flowersToUpdate = flowersToUpdate.slice(0, options.maxFlowers);
      }

      if (flowersToUpdate.length === 0) {
        return {
          success: true,
          updatedCount: 0,
          totalFlowers: flowers.length,
          updateDetails: [],
          statistics: {
            totalHPChange: 0,
            averageHPChange: 0,
            updateDuration: Date.now() - startTime
          }
        };
      }

      // 批量更新
      const batchSize = options.batchSize || this.UPDATE_STRATEGY.BATCH_UPDATE.MAX_BATCH_SIZE;
      const updateDetails = [];
      const currentTime = new Date();

      for (let i = 0; i < flowersToUpdate.length; i += batchSize) {
        const batch = flowersToUpdate.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (flowerStatus) => {
          const flower = flowerStatus.flower;
          const beforeHP = flower.hp;
          
          // 🌟 简化：使用遗忘曲线计算新的血量值
          const newHP = Math.max(0, Math.round(FlowerMemoryService.calculateFlowerHP(flower, currentTime)));
          
          flower.hp = newHP;
          flower.lastUpdatedAt = currentTime;
          await flower.save();

          return {
            flowerId: flower._id.toString(),
            subject: flower.subject,
            beforeHP,
            afterHP: newHP,
            hpChange: newHP - beforeHP,
            priority: flowerStatus.updatePriority
          };
        });

        const batchResults = await Promise.all(batchPromises);
        updateDetails.push(...batchResults);

        // 批次间隔
        if (i + batchSize < flowersToUpdate.length) {
          await new Promise(resolve => setTimeout(resolve, this.UPDATE_STRATEGY.BATCH_UPDATE.UPDATE_INTERVAL_MS));
        }
      }

      const totalHPChange = updateDetails.reduce((sum, detail) => sum + detail.hpChange, 0);
      const averageHPChange = updateDetails.length > 0 ? totalHPChange / updateDetails.length : 0;

      logger.info(`用户 ${userId} 智能更新完成: ${updateDetails.length}/${flowers.length} 朵花，总变化${totalHPChange}HP`);

      return {
        success: true,
        updatedCount: updateDetails.length,
        totalFlowers: flowers.length,
        updateDetails,
        statistics: {
          totalHPChange,
          averageHPChange: Math.round(averageHPChange * 100) / 100,
          updateDuration: Date.now() - startTime
        }
      };

    } catch (error) {
      logger.error('智能更新花朵血量失败:', error);
      throw error;
    }
  }

  /**
   * 🌟 简化：计算更新优先级
   * 基于24小时规则和数据库血量状态
   */
  private static calculateUpdatePriority(
    flower: IFlower, 
    databaseHP: number, 
    currentTime: Date
  ): 'low' | 'medium' | 'high' | 'critical' {
    // 🌟 首先检查是否满足24小时更新条件
    const latestTimestamp = this.getLatestTimestamp(flower);
    const hoursSinceLatest = (currentTime.getTime() - latestTimestamp.getTime()) / (1000 * 60 * 60);

    // 如果未满足24小时条件，直接返回low
    if (hoursSinceLatest < this.UPDATE_STRATEGY.AUTO_UPDATE_CONDITIONS.REQUIRED_UPDATE_INTERVAL_HOURS) {
      return 'low';
    }

    // 满足24小时条件后，根据数据库血量状态决定优先级
    const hpPercentage = flower.maxHp > 0 ? (databaseHP / flower.maxHp) * 100 : 0;
    
    // 危险血量：优先级最高
    if (hpPercentage < this.UPDATE_STRATEGY.AUTO_UPDATE_CONDITIONS.CRITICAL_HP_THRESHOLD * 100) {
      return 'critical';
    }

    // 中等血量：中等优先级
    if (hpPercentage < 50) {
      return 'high';
    }

    // 其他情况：正常优先级
    return 'medium';
  }

  /**
   * 🌟 重新设计：获取血量更新建议
   */
  static async getUpdateRecommendations(userId: string): Promise<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    maintenance: string[];
  }> {
    try {
      const updateDecision = await this.shouldUpdateFlowers(userId);

      const recommendations = {
        immediate: [] as string[],
        shortTerm: [] as string[],
        longTerm: [] as string[],
        maintenance: [] as string[]
      };

      if (updateDecision.priority === 'critical') {
        recommendations.immediate.push('🚨 有花朵血量危险，立即更新');
        recommendations.immediate.push('💧 强烈建议使用甘露治疗危险花朵');
      }

      if (updateDecision.priority === 'high' || updateDecision.priority === 'medium') {
        recommendations.immediate.push('⚠️ 建议更新符合24小时条件的花朵');
      }

      if (updateDecision.affectedFlowers > 0) {
        recommendations.shortTerm.push(`📊 ${updateDecision.affectedFlowers} 朵花符合更新条件`);
      }

      // 基于新的24小时规则给出建议
      recommendations.longTerm.push('📈 定期查看血量状态（建议每天检查一次）');
      recommendations.longTerm.push('🔄 花朵血量每24小时自动衰减一次');

      recommendations.maintenance.push('🎯 保持学习频率以维持花朵健康');
      recommendations.maintenance.push('💧 合理使用甘露资源恢复花朵到满血');
      recommendations.maintenance.push('⏰ 系统会自动判断24小时更新条件');

      return recommendations;

    } catch (error) {
      logger.error('获取更新建议失败:', error);
      return {
        immediate: ['❌ 获取建议失败，请稍后重试'],
        shortTerm: [],
        longTerm: [],
        maintenance: []
      };
    }
  }
} 
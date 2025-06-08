import { IFlower } from '../models/Flower';
import { logger } from '../utils/logger';

/**
 * 花朵记忆服务
 * 基于艾宾浩斯遗忘曲线计算花朵的HP衰减
 */
export class FlowerMemoryService {
  
  /**
   * 遗忘曲线参数配置
   */
  private static readonly MEMORY_CONFIG = {
    // 记忆强度常数（小时），影响遗忘速度
    MEMORY_STRENGTH: 72, // 72小时后衰减到约37%
    
    // 最小HP保持率，防止HP降到0
    MIN_HP_RATIO: 0.1, // 最低保持10%的HP
    
    // 甘露治疗后的记忆强化系数
    NECTAR_BOOST_RATIO: 1.5, // 使用甘露后记忆强度提升50%
    
    // 不同学科的记忆衰减系数
    SUBJECT_DECAY_MULTIPLIERS: {
      'chinese': 1.0,    // 语文标准衰减
      'math': 1.2,       // 数学衰减稍快
      'english': 0.9,    // 英语衰减稍慢
      'curious': 0.8,    // 好奇心衰减最慢
      'knowledge': 1.1   // 知识类衰减稍快
    } as { [key: string]: number },
    
    // 不同年级的记忆强度系数
    GRADE_MEMORY_MULTIPLIERS: {
      1: 0.7, 2: 0.75, 3: 0.8,   // 低年级记忆较弱
      4: 0.85, 5: 0.9, 6: 0.95,  // 中年级逐渐增强
      7: 1.0, 8: 1.05, 9: 1.1,   // 高年级记忆较强
      10: 1.15, 11: 1.2, 12: 1.25 // 最高年级记忆最强
    } as { [key: number]: number }
  };

  /**
   * 计算单个花朵的当前HP
   * @param flower 花朵对象
   * @param currentTime 当前时间（可选，默认为现在）
   * @returns 计算后的HP值
   */
  static calculateFlowerHP(flower: IFlower, currentTime: Date = new Date()): number {
    // 确定计算基准时间点（种植时间或最后治疗时间）
    const referenceTime = this.getMemoryReferenceTime(flower);
    
    // 计算时间差（小时）
    const timeDiffHours = (currentTime.getTime() - referenceTime.getTime()) / (1000 * 60 * 60);
    
    // 如果时间差为负数或0，返回满HP
    if (timeDiffHours <= 0) {
      return flower.maxHp;
    }
    
    // 获取学科和年级相关的衰减系数
    const subjectMultiplier = this.MEMORY_CONFIG.SUBJECT_DECAY_MULTIPLIERS[flower.subject] || 1.0;
    const gradeMultiplier = this.MEMORY_CONFIG.GRADE_MEMORY_MULTIPLIERS[flower.grade] || 1.0;
    
    // 计算有效记忆强度
    const effectiveMemoryStrength = this.MEMORY_CONFIG.MEMORY_STRENGTH * gradeMultiplier / subjectMultiplier;
    
    // 应用艾宾浩斯遗忘曲线公式: R = e^(-t/s)
    const memoryRetentionRate = Math.exp(-timeDiffHours / effectiveMemoryStrength);
    
    // 确保保持率不低于最小值
    const finalRetentionRate = Math.max(memoryRetentionRate, this.MEMORY_CONFIG.MIN_HP_RATIO);
    
    // 计算最终HP
    const calculatedHP = Math.round(flower.maxHp * finalRetentionRate);
    
    logger.debug(`花朵${flower._id}的HP计算: 时间差=${timeDiffHours.toFixed(1)}h, 保持率=${finalRetentionRate.toFixed(3)}, HP=${calculatedHP}/${flower.maxHp}`);
    
    return Math.min(calculatedHP, flower.maxHp);
  }

  /**
   * 批量计算多个花朵的HP
   * @param flowers 花朵数组
   * @param currentTime 当前时间（可选）
   * @returns 更新HP后的花朵数据数组
   */
  static calculateMultipleFlowersHP(flowers: IFlower[], currentTime: Date = new Date()): Array<any> {
    return flowers.map(flower => ({
      ...flower.toObject(),
      calculatedHP: this.calculateFlowerHP(flower, currentTime)
    }));
  }

  /**
   * 获取记忆基准时间（种植时间或最后治疗时间中的较晚者）
   * @param flower 花朵对象
   * @returns 基准时间
   */
  private static getMemoryReferenceTime(flower: IFlower): Date {
    const plantTime = flower.plantedAt;
    const lastHealTime = flower.lastHealedAt;
    
    // 如果没有种植时间，使用创建时间
    if (!plantTime) {
      return flower.createdAt;
    }
    
    // 如果有治疗时间且晚于种植时间，使用治疗时间
    if (lastHealTime && lastHealTime > plantTime) {
      return lastHealTime;
    }
    
    return plantTime;
  }

  /**
   * 计算花朵的记忆状态等级
   * @param currentHP 当前HP
   * @param maxHP 最大HP
   * @returns 记忆状态信息
   */
  static getMemoryStatus(currentHP: number, maxHP: number): {
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    percentage: number;
    description: string;
    color: string;
  } {
    const percentage = (currentHP / maxHP) * 100;
    
    if (percentage >= 90) {
      return {
        level: 'excellent',
        percentage,
        description: '记忆深刻',
        color: '#4caf50'
      };
    } else if (percentage >= 70) {
      return {
        level: 'good',
        percentage,
        description: '记忆良好',
        color: '#8bc34a'
      };
    } else if (percentage >= 50) {
      return {
        level: 'fair',
        percentage,
        description: '记忆一般',
        color: '#ff9800'
      };
    } else if (percentage >= 30) {
      return {
        level: 'poor',
        percentage,
        description: '记忆模糊',
        color: '#ff5722'
      };
    } else {
      return {
        level: 'critical',
        percentage,
        description: '濒临遗忘',
        color: '#f44336'
      };
    }
  }

  /**
   * 预测花朵在指定时间后的HP
   * @param flower 花朵对象
   * @param hoursLater 多少小时后
   * @returns 预测的HP值
   */
  static predictFlowerHP(flower: IFlower, hoursLater: number): number {
    const futureTime = new Date(Date.now() + hoursLater * 60 * 60 * 1000);
    return this.calculateFlowerHP(flower, futureTime);
  }

  /**
   * 计算使用甘露后的记忆强化效果
   * @param flower 花朵对象
   * @param healingAmount 治疗量
   * @returns 强化后的有效记忆时间延长（小时）
   */
  static calculateNectarMemoryBoost(flower: IFlower, healingAmount: number): number {
    // 根据治疗量计算记忆强化时间
    const baseBoostHours = healingAmount * 2; // 每点治疗量延长2小时记忆
    const subjectMultiplier = this.MEMORY_CONFIG.SUBJECT_DECAY_MULTIPLIERS[flower.subject] || 1.0;
    
    return baseBoostHours * this.MEMORY_CONFIG.NECTAR_BOOST_RATIO * subjectMultiplier;
  }

  /**
   * 获取遗忘曲线图表数据
   * @param flower 花朵对象
   * @param durationHours 预测时长（小时）
   * @returns 图表数据点数组
   */
  static getForgetCurveData(flower: IFlower, durationHours: number = 168): Array<{ time: number; hp: number; percentage: number }> {
    const dataPoints = [];
    const intervalHours = durationHours / 50; // 生成50个数据点
    
    for (let i = 0; i <= 50; i++) {
      const timeHours = i * intervalHours;
      const hp = this.predictFlowerHP(flower, timeHours);
      const percentage = (hp / flower.maxHp) * 100;
      
      dataPoints.push({
        time: timeHours,
        hp,
        percentage
      });
    }
    
    return dataPoints;
  }

  /**
   * 计算花园整体记忆健康度
   * @param flowers 花朵数组
   * @returns 整体健康度信息
   */
  static calculateGardenMemoryHealth(flowers: IFlower[]): {
    averageHP: number;
    totalFlowers: number;
    healthyFlowers: number;
    criticalFlowers: number;
    overallGrade: string;
    recommendations: string[];
  } {
    if (flowers.length === 0) {
      return {
        averageHP: 0,
        totalFlowers: 0,
        healthyFlowers: 0,
        criticalFlowers: 0,
        overallGrade: 'N/A',
        recommendations: ['暂无花朵，开始学习获得新花朵吧！']
      };
    }

    const flowersWithHP = this.calculateMultipleFlowersHP(flowers);
    const totalHP = flowersWithHP.reduce((sum, flower) => sum + flower.calculatedHP, 0);
    const averageHP = totalHP / flowers.length;
    
    const healthyFlowers = flowersWithHP.filter(f => (f.calculatedHP / f.maxHp) >= 0.7).length;
    const criticalFlowers = flowersWithHP.filter(f => (f.calculatedHP / f.maxHp) < 0.3).length;
    
    let overallGrade = 'A';
    const recommendations: string[] = [];
    
    const healthyRatio = healthyFlowers / flowers.length;
    const criticalRatio = criticalFlowers / flowers.length;
    
    if (healthyRatio >= 0.8) {
      overallGrade = 'A';
      recommendations.push('花园记忆状态优秀！继续保持！');
    } else if (healthyRatio >= 0.6) {
      overallGrade = 'B';
      recommendations.push('花园记忆状态良好，注意及时复习。');
    } else if (healthyRatio >= 0.4) {
      overallGrade = 'C';
      recommendations.push('部分花朵需要关注，建议增加复习频率。');
    } else {
      overallGrade = 'D';
      recommendations.push('花园记忆状态需要改善！');
    }
    
    if (criticalRatio > 0.2) {
      recommendations.push(`有${criticalFlowers}朵花朵濒临遗忘，请及时使用甘露治疗！`);
    }
    
    return {
      averageHP: Math.round(averageHP),
      totalFlowers: flowers.length,
      healthyFlowers,
      criticalFlowers,
      overallGrade,
      recommendations
    };
  }
} 
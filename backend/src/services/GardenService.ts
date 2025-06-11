import dotenv from 'dotenv';
import { FlowerModel, IFlower } from '../models/Flower';
import { FlowerMemoryService } from './FlowerMemoryService';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

dotenv.config();

export class GardenService {

    /**
     * 更新用户所有花朵的血量
     * 根据遗忘曲线计算并更新数据库中的HP值
     * @param userId 用户ID
     */
    static async updateAllFlowersHP(userId: string): Promise<void> {
        try {
            logger.info(`开始更新用户 ${userId} 所有花朵的血量...`);

            // 获取用户所有花朵
            const flowers = await FlowerModel.find({ 
                userId: new mongoose.Types.ObjectId(userId) 
            });

            if (flowers.length === 0) {
                logger.info(`用户 ${userId} 暂无花朵`);
                return;
            }

            const currentTime = new Date();
            let totalUpdated = 0;

            // 批量更新花朵血量
            for (const flower of flowers) {
                // 计算预期衰退比例
                const forgettingRate = FlowerMemoryService.calculateForgettingRate(flower, currentTime);
                // 计算预期扣血比例，以花的最大血量
                const maxHp = flower.maxHp;
                // 预期扣血量,不用小数点
                const lostHp = Math.round(maxHp * forgettingRate.forgettingRate);
                
                // 当前血量
                const currentHp = flower.hp;
                let updateHp = currentHp - lostHp;
                if(updateHp < 0){
                    updateHp = 0;
                }

                flower.hp = updateHp;
                flower.lastUpdatedAt = currentTime;
                await flower.save();
                
                
                console.log(forgettingRate);
             
            }

            // 输出更新统计
            logger.info(`用户 ${userId} 花朵血量更新完成: 总计${flowers.length}朵花`);
        
        } catch (error) {
            logger.error(`更新用户 ${userId} 花朵血量失败:`, error);
            throw error;
        }
    }

    /**
     * 输出扣血日志表
     * @param updatedFlowers 更新的花朵数据
     */
    private static outputBloodLossLog(updatedFlowers: Array<any>): void {
        logger.info('=== 花朵扣血日志表 ===');
        
        updatedFlowers.forEach((flower, index) => {
            logger.info(`花朵${index + 1}: ${flower.subject}-${flower.grade}-${flower.category}`);
            logger.info(`  ID: ${flower.flowerId}`);
            logger.info(`  原血量: ${flower.originalHP}/${flower.maxHP} HP`);
            logger.info(`  现血量: ${flower.newHP}/${flower.maxHP} HP`);
            logger.info(`  扣血量: ${flower.hpLoss} HP (${flower.hpLossPercentage}%)`);
            logger.info(`  ---`);
        });

        // 统计总体扣血情况
        const totalHpLoss = updatedFlowers.reduce((sum, f) => sum + f.hpLoss, 0);
        const avgHpLoss = (totalHpLoss / updatedFlowers.length).toFixed(2);
        
        logger.info(`=== 扣血统计 ===`);
        logger.info(`总扣血量: ${totalHpLoss} HP`);
        logger.info(`平均扣血量: ${avgHpLoss} HP`);
        logger.info(`更新花朵数: ${updatedFlowers.length}`);
        
        // 输出每天扣血预测（基于第一朵花的遗忘曲线作为示例）
        if (updatedFlowers.length > 0) {
            this.outputDailyBloodLossExample();
        }
    }

    /**
     * 输出每天扣血示例表
     */
    private static outputDailyBloodLossExample(): void {
        logger.info('\n=== 遗忘曲线扣血示例（标准100HP花朵）===');
        logger.info('基于艾宾浩斯遗忘曲线，以下是标准花朵的扣血时间表：');
        
        // 模拟一朵标准花朵的遗忘曲线
        const mockFlower = {
            maxHp: 100,
            plantedAt: new Date(),
            lastHealedAt: null,
            subject: 'math',
            grade: 5
        };

        logger.info('┌─────────┬─────────────┬─────────────┬─────────────┬─────────────┐');
        logger.info('│  时间   │   保持率    │   剩余血量  │   扣血量    │  累计扣血   │');
        logger.info('├─────────┼─────────────┼─────────────┼─────────────┼─────────────┤');
        
        const timePoints = [
          { hours: 1, label: '1小时后' },
          { hours: 6, label: '6小时后' },
          { hours: 12, label: '12小时后' },
          { hours: 24, label: '1天后' },
          { hours: 48, label: '2天后' },
          { hours: 72, label: '3天后' },
          { hours: 168, label: '7天后' },
          { hours: 336, label: '14天后' },
          { hours: 720, label: '30天后' }
        ];

        let previousHP = 100;
        timePoints.forEach(point => {
            // 使用遗忘曲线公式计算
            const memoryStrength = 72; // FlowerMemoryService 中的配置
            const retentionRate = Math.exp(-point.hours / memoryStrength);
            const finalRetentionRate = Math.max(retentionRate, 0.1); // 最低10%
            const currentHP = Math.round(100 * finalRetentionRate);
            const dailyLoss = previousHP - currentHP;
            const cumulativeLoss = 100 - currentHP;
            
            const timeStr = point.label.padEnd(7);
            const retentionStr = (finalRetentionRate * 100).toFixed(1).padStart(9) + '%';
            const hpStr = currentHP.toString().padStart(9) + 'HP';
            const lossStr = dailyLoss.toString().padStart(9) + 'HP';
            const cumStr = cumulativeLoss.toString().padStart(9) + 'HP';
            
            logger.info(`│ ${timeStr} │ ${retentionStr} │ ${hpStr} │ ${lossStr} │ ${cumStr} │`);
            
            previousHP = currentHP;
        });
        
        logger.info('└─────────┴─────────────┴─────────────┴─────────────┴─────────────┘');
        logger.info('注意：');
        logger.info('• 实际扣血会根据学科、年级和最后治疗时间有所不同');
        logger.info('• 使用甘露治疗后会重置遗忘曲线');
        logger.info('• 最低保持10%的血量，不会完全归零');
    }

    /**
     * 获取花朵的详细扣血时间表（未来7天每天的预计扣血量）
     * @param flower 花朵对象
     * @returns 7天的扣血预测表
     */
    static getFlowerBloodLossSchedule(flower: IFlower): Array<{
        day: number;
        date: string;
        predictedHP: number;
        dailyLoss: number;
        cumulativeLoss: number;
        lossPercentage: number;
    }> {
        const schedule = [];
        const currentTime = new Date();
        let previousHP = FlowerMemoryService.calculateFlowerHP(flower, currentTime);

        for (let day = 1; day <= 7; day++) {
            const futureTime = new Date(currentTime.getTime() + day * 24 * 60 * 60 * 1000);
            const predictedHP = FlowerMemoryService.calculateFlowerHP(flower, futureTime);
            const dailyLoss = Math.max(0, previousHP - predictedHP);
            const cumulativeLoss = Math.max(0, flower.maxHp - predictedHP);
            const lossPercentage = (dailyLoss / flower.maxHp * 100);

            schedule.push({
                day,
                date: futureTime.toISOString().split('T')[0],
                predictedHP: Math.round(predictedHP),
                dailyLoss: Math.round(dailyLoss * 100) / 100, // 保留2位小数
                cumulativeLoss: Math.round(cumulativeLoss),
                lossPercentage: Math.round(lossPercentage * 100) / 100
            });

            previousHP = predictedHP;
        }

        return schedule;
    }

    /**
     * 输出花朵扣血预测表（未来7天）
     * @param userId 用户ID
     * @param flowerId 花朵ID（可选，如果不提供则显示所有花朵）
     */
    static async outputFlowerBloodLossSchedule(userId: string, flowerId?: string): Promise<void> {
        try {
            const query: any = { userId: new mongoose.Types.ObjectId(userId) };
            if (flowerId) {
                query._id = new mongoose.Types.ObjectId(flowerId);
            }

            const flowers = await FlowerModel.find(query);

            if (flowers.length === 0) {
                logger.info('未找到相关花朵');
                return;
            }

            logger.info('=== 花朵扣血预测表（未来7天）===');

            flowers.forEach((flower, flowerIndex) => {
                logger.info(`\n花朵${flowerIndex + 1}: ${flower.subject}-${flower.grade}-${flower.category} (ID: ${flower._id})`);
                logger.info(`当前血量: ${flower.hp}/${flower.maxHp} HP`);
                
                const schedule = this.getFlowerBloodLossSchedule(flower);
                
                logger.info('┌─────┬────────────┬──────────┬──────────┬──────────┬────────────┐');
                logger.info('│ 天数│    日期    │ 预计血量 │ 日扣血量 │ 累计扣血 │ 日扣血比例 │');
                logger.info('├─────┼────────────┼──────────┼──────────┼──────────┼────────────┤');
                
                schedule.forEach(day => {
                    const dayStr = day.day.toString().padStart(3);
                    const dateStr = day.date.padEnd(10);
                    const hpStr = `${day.predictedHP}/${flower.maxHp}`.padStart(8);
                    const lossStr = day.dailyLoss.toString().padStart(8);
                    const cumStr = day.cumulativeLoss.toString().padStart(8);
                    const percStr = `${day.lossPercentage}%`.padStart(10);
                    
                    logger.info(`│${dayStr} │ ${dateStr} │ ${hpStr} │ ${lossStr} │ ${cumStr} │ ${percStr} │`);
                });
                
                logger.info('└─────┴────────────┴──────────┴──────────┴──────────┴────────────┘');
            });

        } catch (error) {
            logger.error('输出花朵扣血预测表失败:', error);
        }
    }

    /**
     * 按学科统计血量信息
     * @param userId 用户ID
     */
    static async outputSubjectBloodSummary(userId: string): Promise<void> {
        try {
            const flowers = await FlowerModel.find({ 
                userId: new mongoose.Types.ObjectId(userId) 
            });

            if (flowers.length === 0) {
                logger.info('=== 学科血量统计 ===');
                logger.info('用户暂无花朵');
                return;
            }

            // 按学科分组统计
            const subjectStats: { [key: string]: {
                totalFlowers: number;
                currentHP: number;
                maxHP: number;
                categories: { [key: string]: { count: number; hp: number; maxHp: number } }
            } } = {};

            flowers.forEach(flower => {
                const subject = flower.subject;
                const category = flower.category;
                const currentHP = flower.hp; // 直接使用已更新的血量

                if (!subjectStats[subject]) {
                    subjectStats[subject] = {
                        totalFlowers: 0,
                        currentHP: 0,
                        maxHP: 0,
                        categories: {}
                    };
                }

                subjectStats[subject].totalFlowers++;
                subjectStats[subject].currentHP += currentHP;
                subjectStats[subject].maxHP += flower.maxHp;

                if (!subjectStats[subject].categories[category]) {
                    subjectStats[subject].categories[category] = {
                        count: 0,
                        hp: 0,
                        maxHp: 0
                    };
                }

                subjectStats[subject].categories[category].count++;
                subjectStats[subject].categories[category].hp += currentHP;
                subjectStats[subject].categories[category].maxHp += flower.maxHp;
            });

            logger.info('\n=== 学科血量统计 ===');
            logger.info('学科花的总血量 = 该学科下所有分类花朵的血量之和（使用已更新血量）');
            logger.info('┌──────────┬──────────┬──────────┬──────────┬──────────┬────────────┐');
            logger.info('│   学科   │ 花朵数量 │ 当前血量 │ 最大血量 │ 血量比例 │   分类数   │');
            logger.info('├──────────┼──────────┼──────────┼──────────┼──────────┼────────────┤');

            Object.entries(subjectStats).forEach(([subject, stats]) => {
                const subjectStr = subject.padEnd(8);
                const countStr = stats.totalFlowers.toString().padStart(8);
                const currentStr = Math.round(stats.currentHP).toString().padStart(8);
                const maxStr = stats.maxHP.toString().padStart(8);
                const ratioStr = `${Math.round((stats.currentHP / stats.maxHP) * 100)}%`.padStart(8);
                const categoriesStr = Object.keys(stats.categories).length.toString().padStart(10);

                logger.info(`│ ${subjectStr} │ ${countStr} │ ${currentStr} │ ${maxStr} │ ${ratioStr} │ ${categoriesStr} │`);

                // 输出该学科下各分类的详细信息
                Object.entries(stats.categories).forEach(([category, catStats]) => {
                    const catStr = `  └─${category}`.padEnd(8);
                    const catCountStr = catStats.count.toString().padStart(8);
                    const catCurrentStr = Math.round(catStats.hp).toString().padStart(8);
                    const catMaxStr = catStats.maxHp.toString().padStart(8);
                    const catRatioStr = catStats.maxHp > 0 ? `${Math.round((catStats.hp / catStats.maxHp) * 100)}%`.padStart(8) : '0%'.padStart(8);

                    logger.info(`│ ${catStr} │ ${catCountStr} │ ${catCurrentStr} │ ${catMaxStr} │ ${catRatioStr} │          │`);
                });
            });

            logger.info('└──────────┴──────────┴──────────┴──────────┴──────────┴────────────┘');

            // 总计统计
            const totalFlowers = flowers.length;
            const totalCurrentHP = Math.round(Object.values(subjectStats).reduce((sum, s) => sum + s.currentHP, 0));
            const totalMaxHP = Object.values(subjectStats).reduce((sum, s) => sum + s.maxHP, 0);
            const totalRatio = totalMaxHP > 0 ? Math.round((totalCurrentHP / totalMaxHP) * 100) : 0;

            logger.info(`总计: ${totalFlowers}朵花，当前血量${totalCurrentHP}/${totalMaxHP} (${totalRatio}%)`);

        } catch (error) {
            logger.error('输出学科血量统计失败:', error);
        }
    }

    /**
     * 输出花朵遗忘分析
     * 显示用户所有花朵的遗忘比例和状态
     * @param userId 用户ID
     */
    static async outputFlowerForgettingAnalysis(userId: string): Promise<void> {
        try {
            const flowers = await FlowerModel.find({ 
                userId: new mongoose.Types.ObjectId(userId) 
            });

            if (flowers.length === 0) {
                logger.info('=== 花朵遗忘分析 ===');
                logger.info('用户暂无花朵');
                return;
            }

            logger.info('\n=== 花朵遗忘分析 ===');
            logger.info('基于艾宾浩斯遗忘曲线的花朵记忆状态分析：');

            // 批量计算所有花朵的遗忘率
            const forgettingData = FlowerMemoryService.calculateMultipleForgettingRates(flowers);

            logger.info('┌─────────────────────────┬─────────┬─────────┬─────────┬────────────────┐');
            logger.info('│       花朵信息          │ 学习时长│ 遗忘比例│ 记忆保持│   遗忘状态     │');
            logger.info('├─────────────────────────┼─────────┼─────────┼─────────┼────────────────┤');

            let totalForgettingRate = 0;
            let criticalCount = 0;
            let needReviewCount = 0;

            forgettingData.forEach((item, index) => {
                const flower = item.flower;
                const info = item.forgettingInfo;
                
                const flowerInfo = `${flower.subject}-${flower.grade}-${flower.category}`.padEnd(23);
                const timeInfo = `${info.timeSinceReference}${info.timeUnit}`.padStart(7);
                const forgettingStr = `${(info.forgettingRate * 100).toFixed(1)}%`.padStart(7);
                const retentionStr = `${(info.memoryRetentionRate * 100).toFixed(1)}%`.padStart(7);
                const statusStr = info.forgettingStage.padEnd(14);

                logger.info(`│ ${flowerInfo} │ ${timeInfo} │ ${forgettingStr} │ ${retentionStr} │ ${statusStr} │`);

                totalForgettingRate += info.forgettingRate;
                
                if (info.forgettingRate >= 0.7) {
                    criticalCount++;
                } else if (info.forgettingRate >= 0.5) {
                    needReviewCount++;
                }
            });

            logger.info('└─────────────────────────┴─────────┴─────────┴─────────┴────────────────┘');

            // 统计信息
            const averageForgetting = (totalForgettingRate / flowers.length * 100).toFixed(1);
            const averageRetention = (100 - parseFloat(averageForgetting)).toFixed(1);

            logger.info(`\n=== 遗忘统计摘要 ===`);
            logger.info(`总花朵数: ${flowers.length}`);
            logger.info(`平均遗忘率: ${averageForgetting}%`);
            logger.info(`平均记忆保持率: ${averageRetention}%`);
            logger.info(`需要重新学习的花朵: ${criticalCount}朵 (遗忘率≥70%)`);
            logger.info(`需要深度复习的花朵: ${needReviewCount}朵 (遗忘率50%-70%)`);

            // 给出建议
            logger.info(`\n=== 学习建议 ===`);
            if (criticalCount > 0) {
                logger.info(`🚨 紧急：${criticalCount}朵花朵处于重度遗忘状态，建议立即重新学习`);
            }
            if (needReviewCount > 0) {
                logger.info(`⚠️  注意：${needReviewCount}朵花朵需要深度复习，避免进一步遗忘`);
            }
            if (parseFloat(averageForgetting) < 30) {
                logger.info(`✅ 很好：整体记忆状态良好，继续保持复习节奏`);
            } else if (parseFloat(averageForgetting) < 50) {
                logger.info(`📚 提醒：平均遗忘率偏高，建议增加复习频率`);
            } else {
                logger.info(`💡 建议：整体遗忘率较高，需要调整学习策略，增加复习强度`);
            }

            // 如果有花朵，输出第一朵花的遗忘曲线对照表作为示例
            if (flowers.length > 0) {
                logger.info(`\n=== 示例：${flowers[0].subject}-${flowers[0].grade}-${flowers[0].category} 的遗忘曲线对照 ===`);
                FlowerMemoryService.outputForgettingCurveReference(flowers[0]);
            }

        } catch (error) {
            logger.error('输出花朵遗忘分析失败:', error);
        }
    }
}
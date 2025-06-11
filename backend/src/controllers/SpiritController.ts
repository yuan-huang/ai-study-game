import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Document } from 'mongoose';
import { Spirit, ISpirit } from '../models/Spirit';
import { UserTask } from '../models/UserTask';
import { Task } from '../models/Task';
import { FlowerModel } from '../models/Flower';
import { IUser, User } from '../models/User';
import { GardenService } from '../services/GardenService';
import { getUserIdFromRequest } from '../utils/authUtils';
import { logger } from '../utils/logger';
import { TowerDefenseRecordModel } from '../models/TowerDefenseRecord';
import { GeminiService } from '../utils/GeminiService';
import { getChatRole } from '../ai/roles/ChatRoles';
import { Chat } from '@google/genai';
import { SpiritChatHistoryModel } from '../models/SpiritChatHistory';

interface ISpiritDoc extends Document {
  _id?: string;
}

export class SpiritController extends BaseController<ISpiritDoc> {
  private geminiService: GeminiService;

  constructor() {
    super(Spirit);
    this.geminiService = GeminiService.getInstance();
  }

  // 检查并更新花朵血量
  async checkAndUpdateFlowerHP(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        return this.sendError(res, '未找到用户ID');
      }

      // 更新花朵血量
      await GardenService.updateAllFlowersHP(userId);

      // 获取所有花朵
      const flowers = await FlowerModel.find({ userId });
      const lowHPFlowers = flowers.filter(flower => flower.hp < 50);

      // 如果有花朵血量低于50%，创建任务
      if (lowHPFlowers.length > 0) {
        await this.createFlowerTasks(userId, lowHPFlowers);
      }

      // 获取今日任务列表
      const tasks = await this.getTodayTasks(userId);

      this.sendSuccess(res, {
        flowers: flowers.map(f => ({
          id: f._id,
          hp: f.hp,
        })),
        tasks
      });
    } catch (error) {
      logger.error('检查花朵血量失败:', error);
      this.sendError(res, '检查花朵血量失败');
    }
  }

  // 获取欢迎语句
  async getWelcomeMessage(req: Request, res: Response) {
    try {
      const userId = req.user.userId;

      // 获取或创建精灵
      let spirit = await Spirit.findOne({ userId });
      if (!spirit) {
        spirit = await Spirit.create({
          userId,
          intimacyLevel: 1,
          intimacyScore: 0,
          lastLoginTime: new Date()
        });
      }

      // 更新最后登录时间
      spirit.lastLoginTime = new Date();
      await spirit.save();

      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        return this.sendError(res, '未找到用户信息');
      }

      // 生成欢迎语句
      const welcomeMessage = await this.generateWelcomeMessage(
        user,spirit
      );

      this.sendSuccess(res, {
        welcomeMessage,
        spirit: {
          intimacyLevel: spirit.intimacyLevel,
          intimacyScore: spirit.intimacyScore,
          currentLevel: spirit.currentLevel
        }
      });
    } catch (error) {
      logger.error('获取欢迎语句失败:', error);
      this.sendError(res, '获取欢迎语句失败');
    }
  }

  // 获取精灵亲密度
  async getIntimacy(req: Request, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return this.sendError(res, '未找到用户ID');
      }

      const spirit = await Spirit.findOne({ userId });
      if (!spirit) {
        return this.sendError(res, '未找到精灵信息');
      }

      this.sendSuccess(res, {
        intimacyLevel: spirit.intimacyLevel,
        intimacyScore: spirit.intimacyScore
      });
    } catch (error) {
      logger.error('获取亲密度失败:', error);
      this.sendError(res, '获取亲密度失败');
    }
  }

  // 获取用户信息
  async getUserInfo(req: Request, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) {
        return this.sendError(res, '未找到用户ID');
      }

      const user = await User.findById(userId);
      if (!user) {
        return this.sendError(res, '未找到用户信息');
      }

      const spirit = await Spirit.findOne({ userId });
      const flowers = await FlowerModel.find({ userId });
      const towerDefenseRecords = await TowerDefenseRecordModel.find({ userId });

      // 计算上次登录到现在天数
      const lastLoginTime = spirit?.lastLoginTime || new Date();
      const daysSinceLastLogin = Math.floor(
        (new Date().getTime() - lastLoginTime.getTime()) / (1000 * 60 * 60 * 24)
      );

      this.sendSuccess(res, {
        userId: user._id,
        name: user.username,
        totalLevels: towerDefenseRecords.length,
        flowerCount: flowers.length,
        daysSinceLastLogin,
        spirit: spirit ? {
          intimacyLevel: spirit.intimacyLevel,
          currentLevel: spirit.currentLevel
        } : null
      });
    } catch (error) {
      logger.error('获取用户信息失败:', error);
      this.sendError(res, '获取用户信息失败');
    }
  }

  // 私有辅助方法

  private async createFlowerTasks(userId: string, flowers: any[]) {
    const tasks = await Task.find({ isActive: true });
    
    for (const flower of flowers) {
      const task = tasks.find(t => t.type === 'FLOWER_HEAL');
      if (task) {
        await UserTask.create({
          userId,
          taskId: task._id,
          progress: 0,
          isCompleted: false
        });
      }
    }
  }

  private async getTodayTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userTasks = await UserTask.find({
      userId,
      createdAt: { $gte: today }
    }).populate('taskId');

    return userTasks.map(ut => ({
      id: ut._id,
      description: (ut.taskId as any).description,
      progress: ut.progress,
      target: (ut.taskId as any).target,
      reward: (ut.taskId as any).reward,
      isCompleted: ut.isCompleted
    }));
  }

    private async generateWelcomeMessage(user:IUser,spirit:ISpirit): Promise<string> {
        const {username,level,loginHistory} = user;
        const daysSinceLastLogin = Math.floor(
            (new Date().getTime() - loginHistory.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
          );

        const fairyTutorChatRole = getChatRole('fairyTutor');
    const prompt =  `
    你的回复内容，控制在100字以内
    用户名：${username}
    精灵亲密度等级：${spirit.intimacyLevel}
    精灵当前等级：${spirit.currentLevel}
    距离上次登录已经过去了${daysSinceLastLogin}天
    `;

    try {
      const response = await this.geminiService.generateContent(
        fairyTutorChatRole.initialPrompt,
        prompt);
      return response;
    } catch (error) {
      logger.error('生成欢迎语句失败:', error);
      return `欢迎回来，${username}！让我们一起继续学习吧！`;
    }
  }

  //连续对话模式
  async chatWithSpirit(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const userId = req.user.userId;

      if (!message) {
        return res.status(400).json({ error: '缺少必要参数' });
      }

      // 获取历史对话记录
      const chatHistory = await SpiritChatHistoryModel.findOne({ userId });
      const history = chatHistory?.history || [];

      // 构建历史对话记录
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // 创建新的对话实例
      const fairyAssistant = getChatRole('fairyAssistant');
      const responseMessage = await this.geminiService.chatWithHistory(
        fairyAssistant.initialPrompt,
        message,
        formattedHistory
      );


      // 保存新的对话记录到数据库
      await SpiritChatHistoryModel.findOneAndUpdate(
        { userId },
        {
          $push: {
            history: [
              { 
                role: 'user', 
                content: message,
                timestamp: new Date()
              },
              { 
                role: 'model', 
                content: responseMessage,
                timestamp: new Date()
              }
            ]
          }
        },
        { upsert: true, new: true }
      );

      return this.sendSuccess(res, {
        "message": responseMessage
      });

    } catch (error) {
      console.error('对话错误:', error);
      return res.status(500).json({ error: '对话处理失败' });
    }
  }

  // 获取用户的对话历史
  async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      
      const chatHistory = await SpiritChatHistoryModel.findOne({ userId })
        .sort({ 'history.timestamp': -1 })
        .limit(50);

      return this.sendSuccess(res, {
        history: chatHistory?.history || []
      });

    } catch (error) {
      console.error('获取对话历史错误:', error);
      return res.status(500).json({ error: '获取对话历史失败' });
    }
  }

  // 清除对话历史
  async clearChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      await SpiritChatHistoryModel.findOneAndUpdate({ userId }, { history: [] });
      return this.sendSuccess(res, { message: '对话历史已清除' });
    } catch (error) {
      console.error('清除对话历史错误:', error);
      return this.sendError(res, '清除对话历史失败');
    }
  }





} 
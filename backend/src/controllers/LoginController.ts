import { Request, Response } from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';
import { FlowerModel } from '../models/Flower';
import { TowerDefenseRecordModel } from '../models/TowerDefenseRecord';
import { CuriousTreeGrowthModel } from '../models/CuriousTreeGrowth';

export class LoginController {

  // 用户登录/注册
   async login(req: Request, res: Response) {
    try {
      const { username, grade, subjects, profile } = req.body;

      // 查找或创建用户
      let user = await User.findOne({ username });
      
      if (!user) {
        // 创建新用户
        user = new User({
          username,
          grade,
          subjects,
          displayName: username,
          school: profile?.school,
          className: profile?.className,
          gender: profile?.gender || '男孩'
        });
        await user.save();

        // 创建好奇树成长值
        const curiousTreeGrowth = new CuriousTreeGrowthModel({
          userId: user._id,
          growthValue: 0,
          level: 1
        });
        await curiousTreeGrowth.save();

        // 创建精灵
        logger.info(`新用户注册: ${username}`);
      } else {
        // 更新用户信息
        user.grade = grade;
        user.subjects = subjects;

        if (profile) {
          if (profile.school) user.school = profile.school;
          if (profile.className) user.className = profile.className;
          if (profile.gender) user.gender = profile.gender;
        }
        if (!user.loginHistory) {
          user.loginHistory = {
            lastLogin: new Date(),
            loginCount: 1
          };
        } else {
          user.loginHistory.lastLogin = new Date();
          user.loginHistory.loginCount += 1;
        }
        await user.save();
        logger.info(`用户登录: ${username}`);
      }

      // 生成 JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          username: user.username,
          grade: user.grade
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            level: user.level,
            experience: user.experience,
            coins: user.coins,
            grade: user.grade,
            subjects: user.subjects,
            school: user.school,
            className: user.className,
            gender: user.gender,
            inventory: user.inventory,
            gameProgress: user.gameProgress
          },
          token: token
        }
      });

    } catch (error) {
      logger.error('登录错误:', error);
      res.status(500).json({
        success: false,
        error: '登录失败'
      });
    }
  }

  // 用户登出
   async logout(req: Request, res: Response) {
    try {
      // 由于使用JWT，服务器端不需要维护session
      // 客户端需要清除token即可
      res.json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      logger.error('登出错误:', error);
      res.status(500).json({
        success: false,
        error: '登出失败'
      });
    }
  }

  // 获取用户信息
   async getUserProfile(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select('-__v');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 统计用户获取花朵数量
      const flowerCount = await FlowerModel.countDocuments({ userId });

      // 统计用户闯关次数
      const towerDefenseCount = await TowerDefenseRecordModel.countDocuments({ userId });

      //复习次数
      const reviewCount = towerDefenseCount-flowerCount;

      //好奇树等级
      const curiousTreeGrowth = await CuriousTreeGrowthModel.findOne({ userId });

      res.json({
        success: true,
        data: { user, flowerCount, towerDefenseCount, reviewCount, curiousTreeGrowth }
      });

    } catch (error) {
      logger.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        error: '获取用户信息失败'
      });
    }
  }
}

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = express.Router();

// 用户登录/注册
router.post('/login', [
  body('username').trim().isLength({ min: 2, max: 20 }).withMessage('用户名长度必须在2-20字符之间'),
  body('grade').isInt({ min: 1, max: 12 }).withMessage('年级必须在1-12之间'),
  body('subjects').isArray().withMessage('科目必须是数组'),
  body('profile').optional().isObject().withMessage('个人信息必须是对象'),
  body('profile.school').optional().isString().withMessage('学校必须是字符串'),
  body('profile.className').optional().isString().withMessage('班级必须是字符串'),
  body('profile.gender').optional().isIn(['男孩', '女孩']).withMessage('性别必须是男孩或女孩')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, grade, subjects, profile } = req.body;

    // 查找或创建用户
    let user = await User.findOne({ username });
    
    // 生成随机32位字符串作为sessionId
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    if (!user) {
      // 创建新用户
      user = new User({
        username,
        grade,
        subjects,
        displayName: username,
        school: profile?.school,
        className: profile?.className,
        gender: profile?.gender || '男孩',
        sessionId: sessionId
      });
      await user.save();
      logger.info(`新用户注册: ${username}`);
    } else {
      // 更新用户信息
      user.grade = grade;
      user.subjects = subjects;
      user.sessionId = sessionId;

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
        sessionId: sessionId
      }
    });

  } catch (error) {
    logger.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: '登录失败'
    });
  }
});

// 获取用户信息
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

export default router; 
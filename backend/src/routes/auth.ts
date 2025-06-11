import express from 'express';
import { body } from 'express-validator';
import { LoginController } from '../controllers/LoginController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();

const loginController = new LoginController();

// 用户登录/注册
router.post('/login', [
  body('username').trim().isLength({ min: 2, max: 20 }).withMessage('用户名长度必须在2-20字符之间'),
  body('grade').isInt({ min: 1, max: 12 }).withMessage('年级必须在1-12之间'),
  body('subjects').isArray().withMessage('科目必须是数组'),
  body('profile').optional().isObject().withMessage('个人信息必须是对象'),
  body('profile.school').optional().isString().withMessage('学校必须是字符串'),
  body('profile.className').optional().isString().withMessage('班级必须是字符串'),
  body('profile.gender').optional().isIn(['男孩', '女孩']).withMessage('性别必须是男孩或女孩')
], loginController.login.bind(loginController));

// 用户登出
router.post('/logout', loginController.logout.bind(loginController));

// 获取用户信息
router.get('/profile', authenticateToken, loginController.getUserProfile.bind(loginController));


export default router; 
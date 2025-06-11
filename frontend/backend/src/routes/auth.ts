import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 从环境变量中获取 JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'knowledge-garden';


// ... existing code ... 
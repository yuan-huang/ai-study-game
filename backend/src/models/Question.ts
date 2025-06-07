import mongoose from 'mongoose';

// 题目数据接口
export interface IQuestion {
  id: number;
  question: string;
  options: string[];
  right_answer: string;
  category: string;
  level: string;
  explanation: string;
  subject: string;
  grade: number;
  source?: string;
  tags?: string[];
  difficulty_score?: number;
  usage_count?: number;
  correct_rate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 题目Schema
const QuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  question: { type: String, required: true, unique: true },
  options: { type: [String], required: true },
  right_answer: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  explanation: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: Number, required: true },
  source: { type: String, default: '' },
  tags: { type: [String], default: [] },
  difficulty_score: { type: Number, default: 0 },
  usage_count: { type: Number, default: 0 },
  correct_rate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 创建索引
QuestionSchema.index({ question: 1 }, { unique: true });
QuestionSchema.index({ question: 'text' });
QuestionSchema.index({ category: 1 });
QuestionSchema.index({ level: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ difficulty_score: 1 });
QuestionSchema.index({ subject: 1 });
QuestionSchema.index({ grade: 1 });
QuestionSchema.index({ subject: 1, grade: 1 });
QuestionSchema.index({ category: 1, level: 1 });

// 动态创建题目模型的函数
export function createQuestionModel(subject: string, grade: number) {
  const collectionName = `questions_${subject}_grade${grade}`;
  
  // 如果模型已存在，直接返回
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }
  
  return mongoose.model(collectionName, QuestionSchema, collectionName);
}

// 获取关卡数据的接口
export interface ILevelData {
  category: string;
  count: number;
  difficulty_score: number;
}

export interface ILevelResponse {
  subject: string;
  grade: number;
  categories: ILevelData[];
} 
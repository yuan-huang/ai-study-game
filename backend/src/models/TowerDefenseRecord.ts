import mongoose from 'mongoose';

export interface ITowerDefenseRecord extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  grade: number;
  category: string;
  questionIds: mongoose.Types.ObjectId[];
  wrongQuestionIds: mongoose.Types.ObjectId[];
  completionTime: number; // 通关时间(毫秒)
  score: number;
  comboCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const towerDefenseRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: { type: Number, required: true },
  category: { type: String, required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  wrongQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  completionTime: { type: Number, required: true },
  score: { type: Number, required: true },
  comboCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// 创建复合索引用于快速查询用户在特定组合下的通过次数
towerDefenseRecordSchema.index({ userId: 1, subject: 1, grade: 1, category: 1 });

export const TowerDefenseRecord = mongoose.model<ITowerDefenseRecord>('TowerDefenseRecord', towerDefenseRecordSchema); 
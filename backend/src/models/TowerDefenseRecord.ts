import mongoose, { Document, Schema } from 'mongoose';

export interface ITowerDefenseRecord extends Document {
  userId: string;
  level?: number;
  score: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  subject: string;
  grade: number;
  category: string;
  completionTime: number;
  questionIds: string[];
  wrongQuestionIds: string[];
  comboCount: number;
}

const TowerDefenseRecordSchema = new Schema<ITowerDefenseRecord>({
  userId: { type: String, required: true },
  level: { type: Number, required: false },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// 添加索引
TowerDefenseRecordSchema.index({ userId: 1 });
TowerDefenseRecordSchema.index({ userId: 1, level: 1 });

export const TowerDefenseRecordModel = mongoose.model<ITowerDefenseRecord>('TowerDefenseRecord', TowerDefenseRecordSchema); 
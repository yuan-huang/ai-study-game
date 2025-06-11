import mongoose, { Document, Schema } from 'mongoose';

export interface ISpirit extends Document {
  userId: string;
  intimacyLevel: number;
  intimacyScore: number;
  lastLoginTime: Date;
  currentLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const SpiritSchema = new Schema<ISpirit>({
  userId: { type: String, required: true, unique: true },
  intimacyLevel: { type: Number, default: 1 },
  intimacyScore: { type: Number, default: 0 },
  lastLoginTime: { type: Date, default: Date.now },
  currentLevel: { type: Number, default: 1 },
}, {
  timestamps: true
});

// 添加索引
SpiritSchema.index({ userId: 1 });

export const Spirit = mongoose.model<ISpirit>('Spirit', SpiritSchema); 
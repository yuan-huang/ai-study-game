import mongoose from 'mongoose';

export interface IFlower extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  grade: number;
  category: string;
  hp: number;
  maxHp: number;
  isPlanted: boolean;
  gardenPositionX?: number;
  gardenPositionY?: number;
  plantedAt?: Date;
  lastHealedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const flowerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: { type: Number, required: true },
  category: { type: String, required: true },
  hp: { type: Number, default: 100 },
  maxHp: { type: Number, default: 100 },
  isPlanted: { type: Boolean, default: false },
  gardenPositionX: { type: Number },
  gardenPositionY: { type: Number },
  plantedAt: { type: Date },
  lastHealedAt: { type: Date }
}, {
  timestamps: true
});

// 创建索引用于快速查询用户的花朵
flowerSchema.index({ userId: 1 });
flowerSchema.index({ userId: 1, subject: 1, grade: 1, category: 1 });

export const Flower = mongoose.model<IFlower>('Flower', flowerSchema); 
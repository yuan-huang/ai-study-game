import mongoose from 'mongoose';

export interface INectar extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  grade: number;
  category: string;
  healingPower: number; // 恢复HP的数值
  createdAt: Date;
  updatedAt: Date;
}

const nectarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  grade: { type: Number, required: true },
  category: { type: String, required: true },
  healingPower: { type: Number, default: 1 } // 每次可以恢复1HP
}, {
  timestamps: true
});

// 创建索引用于快速查询用户的甘露
nectarSchema.index({ userId: 1 });
nectarSchema.index({ userId: 1, subject: 1, grade: 1, category: 1 });

export const Nectar = mongoose.model<INectar>('Nectar', nectarSchema); 
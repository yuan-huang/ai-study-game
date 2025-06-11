import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  type: string;
  description: string;
  reward: number;
  target: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  target: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// 添加索引
TaskSchema.index({ type: 1 });
TaskSchema.index({ isActive: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema); 
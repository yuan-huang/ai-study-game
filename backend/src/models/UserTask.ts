import mongoose, { Document, Schema } from 'mongoose';

export interface IUserTask extends Document {
  userId: string;
  taskId: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserTaskSchema = new Schema<IUserTask>({
  userId: { type: String, required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  progress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, {
  timestamps: true
});

// 添加索引
UserTaskSchema.index({ userId: 1 });
UserTaskSchema.index({ taskId: 1 });
UserTaskSchema.index({ isCompleted: 1 });

export const UserTask = mongoose.model<IUserTask>('UserTask', UserTaskSchema); 
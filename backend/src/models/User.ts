import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  displayName: string;
  school?: string;
  className?: string;
  gender: '男孩' | '女孩';
  grade: number;
  subjects: string[];
  experience: number;
  level: number;
  coins: number;
  inventory: {
    seeds: string[];
    tools: string[];
    fruits: string[];
  };
  gameProgress: {
    completedTasks: string[];
    achievements: string[];
  };
  loginHistory: {
    lastLogin: Date;
    loginCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
  sessionId: string;
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  school: { type: String },
  className: { type: String },
  gender: { type: String, required: true, enum: ['男孩', '女孩'] },
  grade: { type: Number, required: true },
  subjects: { type: [String], required: true },
  experience: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  inventory: {
    seeds: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    fruits: { type: [String], default: [] }
  },
  gameProgress: {
    completedTasks: { type: [String], default: [] },
    achievements: { type: [String], default: [] }
  },
  loginHistory: {
    lastLogin: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 }
  },
  sessionId: { type: String, required: false }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 
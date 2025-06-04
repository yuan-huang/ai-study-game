import mongoose, { Schema, Document } from 'mongoose';

export interface ISeed extends Document {
  name: string;
  type: string;
  subject: string;
  grade: number;
  knowledge_points: string[];
  difficulty: number; // 1-5级难度
  growth_stages: {
    stage: string;
    tasks: {
      type: 'watering' | 'fertilizing' | 'pest_control' | 'harvest';
      completed: boolean;
      score?: number;
    }[];
  }[];
  rewards: {
    experience: number;
    coins: number;
    fruits: string[];
  };
  owner: mongoose.Types.ObjectId;
  planted_at?: Date;
  status: 'seed' | 'growing' | 'mature' | 'harvested';
  current_stage: number;
  createdAt: Date;
  updatedAt: Date;
}

const SeedSchema = new Schema<ISeed>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['flower', 'fruit', 'vegetable', 'tree']
  },
  subject: {
    type: String,
    required: true,
    enum: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治']
  },
  grade: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  knowledge_points: [{
    type: String,
    required: true
  }],
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  growth_stages: [{
    stage: {
      type: String,
      required: true,
      enum: ['seedling', 'growing', 'flowering', 'fruiting']
    },
    tasks: [{
      type: {
        type: String,
        required: true,
        enum: ['watering', 'fertilizing', 'pest_control', 'harvest']
      },
      completed: { type: Boolean, default: false },
      score: { type: Number, min: 0, max: 100 }
    }]
  }],
  rewards: {
    experience: { type: Number, required: true, min: 0 },
    coins: { type: Number, required: true, min: 0 },
    fruits: [{ type: String }]
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planted_at: {
    type: Date
  },
  status: {
    type: String,
    enum: ['seed', 'growing', 'mature', 'harvested'],
    default: 'seed'
  },
  current_stage: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// 索引
SeedSchema.index({ owner: 1 });
SeedSchema.index({ subject: 1, grade: 1 });
SeedSchema.index({ status: 1 });

export const Seed = mongoose.model<ISeed>('Seed', SeedSchema); 
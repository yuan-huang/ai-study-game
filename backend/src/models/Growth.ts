import mongoose, { Schema, Document } from 'mongoose';

export interface IGrowth extends Document {
    userId: string;
    currentGrowth: number;
    maxGrowth: number;
    level: number;
    totalQuestions: number;
    totalRewards: number;
    achievements: string[];
    createdAt: Date;
    updatedAt: Date;
}

const GrowthSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    currentGrowth: {
        type: Number,
        default: 0,
        min: 0
    },
    maxGrowth: {
        type: Number,
        default: 100,
        min: 1
    },
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    totalQuestions: {
        type: Number,
        default: 0,
        min: 0
    },
    totalRewards: {
        type: Number,
        default: 0,
        min: 0
    },
    achievements: [{
        type: String,
        enum: ['first_question', 'curious_explorer', 'deep_thinker', 'knowledge_seeker', 'wisdom_tree']
    }]
}, {
    timestamps: true
});

// 索引优化
GrowthSchema.index({ userId: 1 });
GrowthSchema.index({ level: -1 });

export const Growth = mongoose.model<IGrowth>('Growth', GrowthSchema); 
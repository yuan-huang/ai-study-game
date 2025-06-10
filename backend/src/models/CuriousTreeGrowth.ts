import mongoose, { Schema, Document } from 'mongoose';

export interface ICuriousTreeGrowth extends Document {
    userId: string;
    growthValue: number;
    level: number;
    createdAt: Date;
    updatedAt: Date;
}

const CuriousTreeGrowthSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    growthValue: { type: Number, default: 0, min: 0, max: 100 },
    level: { type: Number, default: 1, min: 1 },
}, { timestamps: true });

export const CuriousTreeGrowthModel = mongoose.model<ICuriousTreeGrowth>('CuriousTreeGrowth', CuriousTreeGrowthSchema); 
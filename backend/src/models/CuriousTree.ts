import { Schema, model, Document } from 'mongoose';

export interface ICuriousTree extends Document {
    userId: string;
    chatHistory: Array<{
        role: 'user' | 'assistant';
        question: string;
        aiResponse: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const CuriousTreeSchema = new Schema<ICuriousTree>({
    userId: { type: String, required: true },
    chatHistory: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        question: { type: String, required: true },
        aiResponse: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const CuriousTreeModel = model<ICuriousTree>('CuriousTree', CuriousTreeSchema); 
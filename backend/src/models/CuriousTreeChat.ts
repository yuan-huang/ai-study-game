import { Schema, model, Document } from 'mongoose';

export interface ICuriousTreeChat extends Document {
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

const CuriousTreeChatSchema = new Schema<ICuriousTreeChat>({
    userId: { type: String, required: true },
    chatHistory: [{
        role: { type: String, enum: ['user', 'assistant'], required: true, default: 'user' },
        question: { type: String, required: true },
        aiResponse: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const CuriousTreeChatModel = model<ICuriousTreeChat>('CuriousTreeChat', CuriousTreeChatSchema); 
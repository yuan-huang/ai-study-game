import mongoose, { Document, Schema } from 'mongoose';

export interface ISpiritChatHistory extends Document {
    userId: string;
    history: Array<{
        role: 'user' | 'model';
        content: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const SpiritChatHistorySchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    history: [{
        role: {
            type: String,
            enum: ['user', 'model'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// 创建索引
SpiritChatHistorySchema.index({ userId: 1, createdAt: -1 });

export const SpiritChatHistoryModel = mongoose.model<ISpiritChatHistory>('SpiritChatHistory', SpiritChatHistorySchema); 
import { post, get, ApiResponse } from '../utils/request';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatResponse {
    message: string;
    growthPoints: number;
}

interface HistoryMessage {
    role: 'assistant';
    question: string;
    aiResponse: string;
    timestamp: string;
    _id: string;
}

interface HistoryResponse {
    success: boolean;
    data: {
        messages: HistoryMessage[];
    };
}

export interface GrowthData {
    growthValue: number;
    level: number;
}


export const curiousTreeApi = {
    // 发送消息
    chat: async (message: string): Promise<ApiResponse<ChatResponse>> => {
        return post('/curioustree/chat', { message });
    },

    // 获取对话历史
    getHistory: async (params: any): Promise<ApiResponse<HistoryResponse>> => {
        return get('/curioustree/history', params);
    },

    // 获取成长值
    getGrowth: async (): Promise<ApiResponse<GrowthData>> => {
        return get('/curioustree/growth');
    },

    // 清空历史记录
    clearHistory: async (): Promise<ApiResponse<void>> => {
        return post('/curioustree//history/clear');
    }
}; 
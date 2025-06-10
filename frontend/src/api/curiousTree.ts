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

export const curiousTreeApi = {
    // 发送消息
    sendMessage: async (message: string): Promise<ApiResponse<ChatResponse>> => {
        return post('/curioustree/chat', { message });
    },

    // 获取对话历史
    getHistory: async (params:any): Promise<ApiResponse<ChatMessage[]>> => {
        return get('/curioustree/history',params);
    }
}; 
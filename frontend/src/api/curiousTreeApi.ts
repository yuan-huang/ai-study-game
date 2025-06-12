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

    // 流式发送消息
    chatStream: async (
        message: string,
        onChunk: (chunk: string) => void
    ): Promise<void> => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('未登录');
        }

        const response = await fetch('/api/curioustree/chat-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('聊天请求失败');
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('无法读取响应流');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const chunk = JSON.parse(line);
                        if (chunk.content) {
                            onChunk(chunk.content);
                        }
                    } catch (error) {
                        console.warn('解析流式响应失败:', line);
                    }
                }
            }
        }

        // 处理剩余的buffer
        if (buffer.trim()) {
            try {
                const chunk = JSON.parse(buffer);
                if (chunk.content) {
                    onChunk(chunk.content);
                }
            } catch (error) {
                console.warn('解析最后的响应失败:', buffer);
            }
        }
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
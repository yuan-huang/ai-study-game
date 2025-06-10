import { post, ApiResponse } from '../utils/request';

export interface AskQuestionRequest {
    question: string;
}

export interface AskQuestionResponse {
    success: boolean;
    answer: string;
    error?: string;
}

interface SmartAskResponse {
    answer: string;
    score: number;
    scoreReason: string;
}

/**
 * AI 相关 API
 */
export const aiApi = {
    /**
     * 向好奇树 AI 提问（传统方式）
     */
    async askQuestion(question: string): Promise<AskQuestionResponse> {
        try {
            const response: ApiResponse<AskQuestionResponse> = await post<AskQuestionResponse>('/ai/ask', {
                question
            });

            if (response.success && response.data) {
                return response.data;
            } else {
                return {
                    success: false,
                    answer: '',
                    error: response.message || '未知错误'
                };
            }
        } catch (error: any) {
            console.error('提问失败:', error);

            let errorMessage = '网络错误，请检查网络连接';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                answer: '',
                error: errorMessage
            };
        }
    },

    /**
     * 智能评分AI提问（直接调用后端API，不通过utils/request）
     */
    async smartAskAI(question: string): Promise<SmartAskResponse> {
        try {
            const response = await fetch('/api/ai/smart-ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            const data = await response.json();

            if (data.success) {
                return {
                    answer: data.answer,
                    score: data.score,
                    scoreReason: data.scoreReason
                };
            } else {
                throw new Error(data.error || '获取智能回答失败');
            }
        } catch (error) {
            console.error('智能AI请求失败:', error);
            throw error;
        }
    }
}; 
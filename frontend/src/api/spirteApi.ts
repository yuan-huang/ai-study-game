import { get, post, ApiResponse } from '../utils/request';


// 获取精灵欢迎语
export const getSpiritWelcome = (): Promise<ApiResponse> => {
  return get('/spirit/welcome');
};

// 与精灵对话
export const chatWithSpirit = (message: string): Promise<ApiResponse> => {
  return post('/spirit/chat', { message });
};

// 获取对话历史
export const getSpiritChatHistory = (): Promise<ApiResponse> => {
  return get('/spirit/chat-history');
};

// 清除对话历史
export const clearSpiritChatHistory = (): Promise<ApiResponse> => {
  return post('/spirit/clear-chat-history');
};





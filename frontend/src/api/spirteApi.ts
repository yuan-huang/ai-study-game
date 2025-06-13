import { get, post, ApiResponse, getWithParams } from '../utils/request';
import { SSEClient } from '../utils/sseClient';


// 获取精灵欢迎语
export const getSpiritWelcome = (): Promise<ApiResponse<{ welcomeMessage: string }>> => {
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

// 与精灵对话（流式）
export const chatWithSpiritStream = async (
  message: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  console.log('初始化SSE客户端...');
  const sseClient = SSEClient.createAuth('/api/spirit/chat-stream', { message });

  try {
    await sseClient.connect(
      (message) => {
        console.log('SSE收到消息:', message);
        if (message.type === 'message' && message.data.content) {
          onChunk(message.data.content);
        }
        return message.data.done;
      },
      (error) => {
        console.error('精灵对话连接错误:', error);
        throw error;
      }
    );
  } finally {
    sseClient.close();
  }
};





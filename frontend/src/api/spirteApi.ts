import { get, post, ApiResponse, getWithParams } from '../utils/request';


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
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未登录');
  }

  const response = await fetch('/api/spirit/chat-stream', {
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
};





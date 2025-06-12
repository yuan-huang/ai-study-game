interface OllamaConfig {
  baseUrl?: string;
  timeout?: number;
}

interface GenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    num_predict?: number;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    num_predict?: number;
  };
}

interface GenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface ChatResponse {
  model: string;
  created_at: string;
  message: ChatMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface ModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

interface TagsResponse {
  models: ModelInfo[];
}

class OllamaService {
  private baseUrl: string;
  private timeout: number;

  constructor(config: OllamaConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.timeout = config.timeout || 30000;
  }

  /**
   * 发送HTTP请求的通用方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API错误 (${response.status}): ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`请求超时 (${this.timeout}ms)`);
        }
        throw new Error(`请求失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 处理流式响应的通用方法
   */
  private async streamRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    onChunk: (chunk: T) => void
  ): Promise<void> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API错误 (${response.status}): ${errorText}`);
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
              const chunk = JSON.parse(line) as T;
              onChunk(chunk);
            } catch (error) {
              console.warn('解析流式响应失败:', line);
            }
          }
        }
      }

      // 处理剩余的buffer
      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer) as T;
          onChunk(chunk);
        } catch (error) {
          console.warn('解析最后的响应失败:', buffer);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`请求超时 (${this.timeout}ms)`);
        }
        throw new Error(`流式请求失败: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * 生成文本 - 兼容Gemini接口的方法
   */
  async generateContent(systemPrompt: string, userPrompt: string): Promise<string> {
    const model = process.env.OLLAMA_MODEL;
    
    try {
      const response = await this.chat({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      });
      
      return response.message.content;
    } catch (error) {
      console.error('Ollama生成内容失败:', error);
      throw error;
    }
  }

  /**
   * 生成文本
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    if (request.stream) {
      throw new Error('流式生成请使用 generateStream 方法');
    }

    return this.request<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ ...request, stream: false }),
    });
  }

  /**
   * 流式生成文本
   */
  async generateStream(
    request: GenerateRequest,
    onChunk: (chunk: GenerateResponse) => void
  ): Promise<void> {
    await this.streamRequest<GenerateResponse>(
      '/api/generate',
      {
        method: 'POST',
        body: JSON.stringify({ ...request, stream: true }),
      },
      onChunk
    );
  }

  /**
   * 聊天对话
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (request.stream) {
      throw new Error('流式聊天请使用 chatStream 方法');
    }

    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ ...request, stream: false }),
    });
  }

  /**
   * 流式聊天对话
   */
  async chatStream(
    request: ChatRequest,
    onChunk: (chunk: ChatResponse) => void
  ): Promise<void> {
    await this.streamRequest<ChatResponse>(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify({ ...request, stream: true }),
      },
      onChunk
    );
  }

  /**
   * 获取可用模型列表
   */
  async listModels(): Promise<TagsResponse> {
    return this.request<TagsResponse>('/api/tags');
  }

  /**
   * 获取模型信息
   */
  async showModel(modelName: string): Promise<any> {
    return this.request('/api/show', {
      method: 'POST',
      body: JSON.stringify({ name: modelName }),
    });
  }

  /**
   * 拉取模型
   */
  async pullModel(
    modelName: string,
    onProgress?: (progress: any) => void
  ): Promise<void> {
    if (onProgress) {
      await this.streamRequest(
        '/api/pull',
        {
          method: 'POST',
          body: JSON.stringify({ name: modelName }),
        },
        onProgress
      );
    } else {
      await this.request('/api/pull', {
        method: 'POST',
        body: JSON.stringify({ name: modelName }),
      });
    }
  }

  /**
   * 删除模型
   */
  async deleteModel(modelName: string): Promise<void> {
    await this.request('/api/delete', {
      method: 'DELETE',
      body: JSON.stringify({ name: modelName }),
    });
  }

  /**
   * 检查Ollama服务是否可用
   */
  async isAlive(): Promise<boolean> {
    try {
      await this.request('/');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取Ollama版本信息
   */
  async getVersion(): Promise<any> {
    return this.request('/api/version');
  }
}

export default OllamaService;
export {
  OllamaConfig,
  GenerateRequest,
  ChatMessage,
  ChatRequest,
  GenerateResponse,
  ChatResponse,
  ModelInfo,
  TagsResponse,
};

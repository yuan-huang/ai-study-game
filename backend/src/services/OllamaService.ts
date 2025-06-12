import { BaseAIService, AIServiceOptions, AIResponse } from './base/BaseAIService';
import { ChatMessage } from '../ai/roles/BaseChatRole';

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

interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

interface OllamaChatResponse {
  model: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
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

export class OllamaService extends BaseAIService {
  private baseUrl: string;
  private modelName: string;

  constructor(modelName: string, options: AIServiceOptions = {}) {
    super(options);
    this.baseUrl = process.env.OLLAMA_BASE_URL;
    this.modelName = process.env.OLLAMA_MODEL;

    console.log(this.baseUrl);
    console.log(this.modelName);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  private async streamRequest<T>(
    path: string,
    init: RequestInit,
    onChunk: (chunk: T) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    if (!response.ok) {
      throw new Error(`Ollama stream request failed: ${response.statusText}`);
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
            onChunk(chunk);
          } catch (error) {
            console.warn('解析流式响应失败:', line);
          }
        }
      }
    }
  }

  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    const request: OllamaChatRequest = {
      model: this.modelName,
      messages: messages.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts[0].text
      })),
      options: {
        temperature: this.options.temperature,
        num_predict: this.options.maxTokens
      }
    };

    const response = await this.request<OllamaChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ ...request, stream: false }),
    });

    return {
      content: response.message.content,
      done: response.done
    };
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (response: AIResponse) => void
  ): Promise<void> {
    const request: OllamaChatRequest = {
      model: this.modelName,
      messages: messages.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.parts[0].text
      })),
      options: {
        temperature: this.options.temperature,
        num_predict: this.options.maxTokens
      }
    };

    await this.streamRequest<OllamaChatResponse>(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify({ ...request, stream: true }),
      },
      (chunk) => {
        onChunk({
          content: chunk.message.content,
          done: chunk.done
        });
      }
    );
  }

  /**
   * 生成文本 - 兼容Gemini接口的方法
   */
  async generateContent(systemPrompt: string, userPrompt: string): Promise<string> {
    const model = process.env.OLLAMA_MODEL;
    
    try {
      const response = await this.chat([
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
          ]);
      
      return response.content;
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
  OllamaChatRequest,
  OllamaChatResponse,
  GenerateResponse,
  ChatResponse,
  ModelInfo,
  TagsResponse,
};

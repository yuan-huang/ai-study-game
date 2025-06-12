import { ChatMessage } from '../../ai/roles/BaseChatRole';

export interface AIServiceOptions {
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface AIResponse {
  content: string;
  done: boolean;
}

export abstract class BaseAIService {
  protected options: AIServiceOptions;

  constructor(options: AIServiceOptions = {}) {
    this.options = options;
  }

  abstract chat(messages: ChatMessage[]): Promise<AIResponse>;
  
  abstract chatStream(
    messages: ChatMessage[],
    onChunk: (response: AIResponse) => void
  ): Promise<void>;
}
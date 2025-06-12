import { BaseAIService } from './base/BaseAIService';
import { OllamaService } from './OllamaService';
import { GeminiService } from './GeminiService';
import aiConfig, { AIModelConfig } from '../config/aiConfig';

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Map<string, BaseAIService> = new Map();

  private constructor() {}

  public static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  public getService(modelConfig: AIModelConfig = aiConfig.defaultModel): BaseAIService {
    const serviceKey = `${modelConfig.type}-${modelConfig.modelName}`;
    
    if (!this.services.has(serviceKey)) {
      let service: BaseAIService;
      
      switch (modelConfig.type) {
        case 'ollama':
          service = new OllamaService(modelConfig.modelName, {
            temperature: modelConfig.temperature,
            maxTokens: modelConfig.maxTokens
          });
          break;
        case 'gemini':
          if (!modelConfig.apiKey) {
            throw new Error('Gemini API key is required');
          }
          service = new GeminiService(modelConfig.apiKey, {
            temperature: modelConfig.temperature,
            maxTokens: modelConfig.maxTokens
          });
          break;
        default:
          throw new Error(`不支持的 AI 模型类型: ${modelConfig.type}`);
      }
      
      this.services.set(serviceKey, service);
    }
    
    return this.services.get(serviceKey)!;
  }
} 
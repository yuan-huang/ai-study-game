import dotenv from 'dotenv';
dotenv.config();

export interface AIModelConfig {
  type: 'ollama' | 'gemini';
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface AIConfig {
  defaultModel: AIModelConfig;
  models: {
    [key: string]: AIModelConfig;
  };
}

const aiConfig: AIConfig = {
  defaultModel: {
    type: process.env.DEFAULT_AI_MODEL_TYPE as 'ollama' | 'gemini' || 'ollama',
    modelName: process.env.DEFAULT_AI_MODEL_NAME || 'gemini-2.0-flash',
    temperature: Number(process.env.DEFAULT_AI_TEMPERATURE) || 0.8,
    maxTokens: Number(process.env.DEFAULT_MAX_TOKENS) || 200,
    apiKey: process.env.GEMINI_API_KEY
  },
  models: {
    ollama: {
      type: 'ollama',
      modelName: process.env.OLLAMA_MODEL || 'gemma3:1b',
      temperature: 0.8,
      maxTokens: 200
    },
    gemini: {
      type: 'gemini',
      modelName: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      temperature: 0.8,
      maxTokens: 200,
      apiKey: process.env.GEMINI_API_KEY
    }
  }
};

export default aiConfig;
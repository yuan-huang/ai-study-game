import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { AIResponse, AIServiceOptions, BaseAIService } from "./base/BaseAIService";
import { ChatMessage } from "../ai/roles/BaseChatRole";

dotenv.config();

interface ChatHistory {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export class GeminiService extends BaseAIService {
  private model: any;
  ai: GoogleGenAI;

  constructor(apiKey: string, options: AIServiceOptions = {}) {
    super(options);
    const config = {
      apiKey:  process.env.GEMINI_API_KEY || '',
      httpOptions: {
        baseUrl: process.env.GEMINI_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'X-Proxy-Auth': 'KnowledgeGarden'
        }
      }
    }
    this.ai = new GoogleGenAI(config);


    console.log(config);
    
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  async chat(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await this.ai.models.generateContent({ model: this.model,
      contents: messages.map(msg => msg.parts[0].text).join('\n') });
    
    return {
      content: response.text,
      done: true
    };
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (response: AIResponse) => void
  ): Promise<void> {

    const response = await this.ai.models.generateContentStream({
      model: this.model,
      contents: messages.map(msg => msg.parts[0].text).join('\n')
    });

    for await (const chunk of response) {
      const chunkText = chunk.text;
      onChunk({
        content: chunkText,
        done: false
      });
    }

    onChunk({
      content: '',
      done: true
    });
  }
} 
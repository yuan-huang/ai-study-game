import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

interface ChatHistory {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export class GeminiService {

    private static instance: GeminiService;
    private ai: GoogleGenAI;
    private baseUrl: string | undefined;

    private constructor() {
        this.baseUrl = process.env.GEMINI_URL_BASE;
        this.ai = new GoogleGenAI({ 
            apiKey: process.env.GEMINI_API_KEY || '',
            httpOptions: {
                baseUrl: this.baseUrl,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Proxy-Auth': `KnowledgeGarden`
                }
            }
        });
    }

    public static getInstance(): GeminiService {
        if (!GeminiService.instance) {
            GeminiService.instance = new GeminiService();
        }
        return GeminiService.instance;
    }


    public async generateContent(systemPrompt: string, prompt: string): Promise<string> {
        //加载配置环境
        const model = process.env.MODEL ||"gemma-3-12b-it"
        console.log("启动模型调用", model);
        const params = {
            model:model,
            contents: prompt,
            config: {
                systemInstruction: systemPrompt,
            },
        }
        try {
            const response  = await this.ai.models.generateContent(params);
            return response.text || '';
        } catch (error) {
            console.error('Gemini API调用错误:', error);
            throw error;
        }
    }



    async chatWithHistory(systemPrompt: string, prompt: string, history: ChatHistory[] = [], model: string = "gemini-2.0-flash") {
        const chat = this.ai.chats.create({
            model,
            config: {
                systemInstruction: systemPrompt,
            },
            history: history,
        });

        const response = await chat.sendMessage({
            message: prompt,
          });
        return response.text;
    }

    

    
} 
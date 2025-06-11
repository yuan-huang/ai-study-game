import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

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


    public async generateContent(systemPrompt: string, prompt: string,model:string = "gemini-2.0-flash" ): Promise<string> {
        const params = {
            model,
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



    

    
} 
import { proxyFetch } from '../utils/proxyFetch';
import { ChatRole } from '../models/ChatRole';
import dotenv from 'dotenv';

dotenv.config();

export class GeminiService {
    private apiKey: string;
    private apiBase: string;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.apiBase = 'https://generativelanguage.googleapis.com/v1beta/models';

        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY 环境变量未设置');
        }
    }

    // 直接调用Gemini API
    private async callGeminiAPI(prompt: string): Promise<string> {
        try {
            const response = await proxyFetch.post(
                `${this.apiBase}/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API调用失败: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("API调用错误:", error);
            throw error;
        }
    }

    // 创建聊天会话
    async createChatSession(role: ChatRole): Promise<ChatRole> {
        try {
            // 发送初始系统提示
            await this.callGeminiAPI(role.initialPrompt);
            return role;
        } catch (error) {
            console.error(`初始化${role.name}失败:`, error);
            throw error;
        }
    }

    // 发送消息并处理回复
    async handleChat(role: ChatRole, message: string): Promise<string> {
        try {
            // 构建完整的提示，包含历史记录
            const fullPrompt = role.history
                .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.parts[0].text}`)
                .join('\n') + `\n用户: ${message}`;

            // 调用API
            const response = await this.callGeminiAPI(fullPrompt);
            
            // 添加用户消息和AI回复到历史记录
            role.addToHistory("user", message);
            role.addToHistory("model", response);
            
            return response;
        } catch (error) {
            console.error("聊天过程中发生错误:", error);
            throw error;
        }
    }

    // 流式调用Gemini API
    async *streamChat(role: ChatRole, message: string): AsyncGenerator<string, void, unknown> {
        try {
            // 构建完整的提示
            const fullPrompt = role.history
                .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.parts[0].text}`)
                .join('\n') + `\n用户: ${message}`;

            const response = await proxyFetch.post(
                `${this.apiBase}/gemini-2.0-flash:streamGenerateContent?key=${this.apiKey}`,
                {
                    contents: [
                        {
                            parts: [{ text: fullPrompt }]
                        }
                    ]
                },
                {
                    headers: {
                        'Accept': 'text/event-stream'
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API调用失败: ${response.status} ${response.statusText}\n${errorText}`);
            }

            let fullResponse = '';
            for await (const chunk of response.body) {
                const text = chunk.toString();
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            // 保存完整的对话历史
                            role.addToHistory("user", message);
                            role.addToHistory("model", fullResponse);
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (content) {
                                fullResponse += content;
                                yield content;
                            }
                        } catch (e) {
                            console.error('解析数据失败:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("流式聊天过程中发生错误:", error);
            throw error;
        }
    }
} 
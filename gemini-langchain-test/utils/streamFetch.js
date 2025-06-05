import { proxyFetch } from './proxyFetch.js';

class GeminiAPI {
    constructor(config = {}) {
        this.config = {
            apiKey: null,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta',
            debug: false,
            ...config
        };

        // 创建chat子命名空间
        this.chat = {
            completions: {
                create: this.createChatCompletion.bind(this)
            }
        };
    }

    async createChatCompletion({
        model = 'gemini-2.0-flash',
        messages,
        stream = false,
        ...options
    }) {
        if (!this.config.apiKey) {
            throw new Error('API密钥未设置');
        }

        try {
            // 处理消息
            let processedMessages = messages.filter(msg => msg.role !== 'system');
            
            // 如果有system消息，将其内容添加到第一个user消息前面
            const systemMsg = messages.find(msg => msg.role === 'system');
            if (systemMsg && processedMessages.length > 0) {
                const firstUserMsg = processedMessages.find(msg => msg.role === 'user');
                if (firstUserMsg) {
                    firstUserMsg.content = `${systemMsg.content}\n\n${firstUserMsg.content}`;
                }
            }

            // 构建请求体
            const requestBody = {
                contents: processedMessages.map(msg => ({
                    parts: [{ text: msg.content }],
                    role: msg.role === 'assistant' ? 'model' : 'user'  // Gemini使用'model'而不是'assistant'
                }))
            };

            if (this.config.debug) {
                console.log('请求体:', JSON.stringify(requestBody, null, 2));
            }

            const response = await proxyFetch.post(
                `${this.config.baseURL}/models/${model}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${this.config.apiKey}`,
                requestBody,
                {
                    headers: {
                        'Accept': stream ? 'text/event-stream' : 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API调用失败: ${response.status} ${response.statusText}\n${errorData}`);
            }

            if (!stream) {
                const data = await response.json();
                return {
                    choices: [{
                        message: {
                            content: data.candidates[0].content.parts[0].text,
                            role: 'assistant'
                        }
                    }]
                };
            }

            // 返回异步迭代器
            return this._createStreamIterator(response);
        } catch (error) {
            if (this.config.debug) {
                console.error('API调用错误:', error);
            }
            throw error;
        }
    }

    async *_createStreamIterator(response) {
        try {
            const textDecoder = new TextDecoder();
            const reader = response.body;

            for await (const chunk of reader) {
                const text = textDecoder.decode(chunk);
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                            
                            if (content) {
                                yield {
                                    id: 'chatcmpl-' + Date.now(),
                                    object: 'chat.completion.chunk',
                                    created: Date.now(),
                                    model: 'gemini-2.0-flash',
                                    choices: [{
                                        index: 0,
                                        delta: {
                                            content: content
                                        },
                                        finish_reason: null
                                    }]
                                };
                            }
                        } catch (e) {
                            if (this.config.debug) {
                                console.error('解析数据失败:', e);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            if (this.config.debug) {
                console.error('流处理错误:', error);
            }
            throw error;
        }
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}

export default GeminiAPI; 
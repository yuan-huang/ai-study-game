interface SSEClientOptions {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: any;
    maxRetries?: number;
    retryDelay?: number;
    maxRetryDelay?: number;
    useAuth?: boolean;  // 是否使用认证
}

interface SSEMessage {
    type: string;
    data: any;
}

type SSEMessageHandler = (message: SSEMessage) => void | boolean;

export class SSEClient {
    private options: Required<SSEClientOptions>;
    private retryCount: number = 0;
    private lastMessage: any = null;
    private abortController: AbortController | null = null;

    constructor(options: SSEClientOptions) {
        this.options = {
            method: 'GET',
            headers: {},
            body: null,
            maxRetries: 3,
            retryDelay: 1000,
            maxRetryDelay: 10000,
            useAuth: true,  // 默认使用认证
            ...options
        };
    }

    /**
     * 创建一个新的 SSE 客户端实例
     * @param url 请求地址
     * @param options 其他选项
     */
    static create(url: string, options: Omit<SSEClientOptions, 'url'> = {}) {
        return new SSEClient({ url, ...options });
    }

    /**
     * 快速创建一个带认证的 SSE 客户端
     * @param url 请求地址
     * @param body 请求体
     * @param options 其他选项
     */
    static createAuth(url: string, body: any = null, options: Omit<SSEClientOptions, 'url' | 'body' | 'useAuth'> = {}) {
        return new SSEClient({
            url,
            method: 'POST',
            body,
            useAuth: true,
            ...options
        });
    }

    /**
     * 开始 SSE 连接
     * @param onMessage 消息处理函数，返回 true 表示结束连接
     * @param onError 错误处理函数
     * @param onComplete 完成处理函数
     */
    async connect(
        onMessage: SSEMessageHandler,
        onError?: (error: Error) => void,
        onComplete?: () => void
    ): Promise<void> {
        this.retryCount = 0;
        await this.startConnection(onMessage, onError, onComplete);
    }

    /**
     * 关闭 SSE 连接
     */
    close(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    private getAuthHeaders(): Record<string, string> {
        if (!this.options.useAuth) {
            return {};
        }

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('未登录');
        }

        return {
            'Authorization': `Bearer ${token}`
        };
    }

    private async startConnection(
        onMessage: SSEMessageHandler,
        onError?: (error: Error) => void,
        onComplete?: () => void
    ): Promise<void> {
        while (this.retryCount < this.options.maxRetries) {
            try {
                this.abortController = new AbortController();
                const response = await fetch(this.options.url, {
                    method: this.options.method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.getAuthHeaders(),
                        ...this.options.headers
                    },
                    body: this.options.body ? JSON.stringify(this.options.body) : undefined,
                    signal: this.abortController.signal
                });

                if (!response.ok) {
                    throw new Error(`SSE连接失败: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error('响应体为空');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                this.lastMessage = data;

                                const shouldStop = onMessage({
                                    type: 'message',
                                    data
                                });

                                if (shouldStop) {
                                    onComplete?.();
                                    return;
                                }
                            } catch (error) {
                                console.warn('解析SSE响应失败:', line);
                            }
                        }
                    }
                }

                // 正常完成
                onComplete?.();
                return;

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }

                console.error(`SSE连接错误 (尝试 ${this.retryCount + 1}/${this.options.maxRetries}):`, error);
                this.retryCount++;

                if (this.retryCount < this.options.maxRetries) {
                    const delay = Math.min(
                        this.options.retryDelay * Math.pow(2, this.retryCount),
                        this.options.maxRetryDelay
                    );
                    await new Promise(resolve => setTimeout(resolve, delay));

                    if (this.lastMessage) {
                        onMessage({
                            type: 'reconnect',
                            data: { message: '连接已恢复，继续接收数据...' }
                        });
                    }
                } else {
                    const error = new Error(`SSE连接失败，已重试${this.options.maxRetries}次`);
                    onError?.(error);
                    throw error;
                }
            }
        }
    }
}

// 使用示例：
/*
// 基本使用
const sseClient = SSEClient.create('/api/stream', {
    method: 'POST',
    body: { message: 'Hello' }
});

// 带认证的简洁使用
const authClient = SSEClient.createAuth('/api/stream', { message: 'Hello' });

// 完整使用
const fullClient = new SSEClient({
    url: '/api/stream',
    method: 'POST',
    headers: {
        'Custom-Header': 'value'
    },
    body: { message: 'Hello' },
    maxRetries: 3,
    useAuth: true
});

try {
    await authClient.connect(
        (message) => {
            if (message.type === 'message') {
                console.log('收到数据:', message.data);
            } else if (message.type === 'reconnect') {
                console.log(message.data.message);
            }
            return message.data.done;
        },
        (error) => {
            console.error('连接错误:', error);
        },
        () => {
            console.log('连接完成');
        }
    );
} catch (error) {
    console.error('连接失败:', error);
} finally {
    authClient.close();
}
*/ 
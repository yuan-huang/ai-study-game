import { Scene } from 'phaser';
import { curiousTreeApi } from '../api/curiousTreeApi';

interface DialogConfig {
    scene: Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    onClose: () => void;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface HistoryMessage {
    role: 'assistant';
    question: string;
    aiResponse: string;
    timestamp: string;
    _id: string;
}

interface HistoryResponse {
    success: boolean;
    data: {
        messages: HistoryMessage[];
    };
}

export class CuriousTreeDialog {
    private scene: Scene;
    private dialogElement: HTMLDivElement;
    private inputBox: HTMLInputElement;
    private messagesContainer: HTMLDivElement;
    private isVisible: boolean = false;

    constructor(config: DialogConfig) {
        this.scene = config.scene;
        
        // 创建主对话框容器
        this.dialogElement = document.createElement('div');
        this.dialogElement.className = 'curious-tree-dialog';
        this.dialogElement.style.width = config.width + 'px';
        this.dialogElement.style.height = config.height + 'px';
        document.body.appendChild(this.dialogElement);

        // 创建标题栏
        const titleBar = document.createElement('div');
        titleBar.className = 'curious-tree-title-bar';
        this.dialogElement.appendChild(titleBar);

        // 添加标题
        const title = document.createElement('div');
        title.className = 'curious-tree-title';
        title.textContent = '🌳 好奇树对话';
        titleBar.appendChild(title);

        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'curious-tree-close-button';
        closeButton.textContent = '×';
        closeButton.onclick = () => {
            this.hide();
            config.onClose();
        };
        titleBar.appendChild(closeButton);

        // 创建消息容器
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'curious-tree-messages-container';
        this.dialogElement.appendChild(this.messagesContainer);

        // 创建输入区域
        const inputContainer = document.createElement('div');
        inputContainer.className = 'curious-tree-input-container';
        this.dialogElement.appendChild(inputContainer);

        // 创建输入框
        this.inputBox = document.createElement('input');
        this.inputBox.className = 'curious-tree-input';
        this.inputBox.type = 'text';
        this.inputBox.placeholder = '输入你的问题...';
        inputContainer.appendChild(this.inputBox);

        // 创建发送按钮
        const sendButton = document.createElement('button');
        sendButton.className = 'curious-tree-send-button';
        sendButton.textContent = '发送';
        sendButton.onclick = () => this.handleSend();
        inputContainer.appendChild(sendButton);

        // 添加回车发送功能
        this.inputBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSend();
            }
        });

        // 初始隐藏
        this.hide();
    }

    private async handleSend(): Promise<void> {
        const message = this.inputBox.value.trim();
        if (!message) return;

        this.inputBox.value = '';
        await this.sendMessage(message);
    }

    private async sendMessage(message: string): Promise<void> {
        // 添加用户消息
        this.addMessage('user', message);

        try {
            // 发送消息到服务器
            const response = await curiousTreeApi.chat(message);
            if (response.success && response.data) {
                // 添加AI回复
                this.addMessage('assistant', response.data.message);
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            this.addMessage('assistant', '抱歉，我遇到了一些问题，请稍后再试。');
        }
    }

    private addMessage(role: 'user' | 'assistant', content: string): void {
        const messageDiv = document.createElement('div');
        messageDiv.className = `curious-tree-message curious-tree-message-${role}`;
        messageDiv.textContent = content;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    public show(): void {
        this.dialogElement.style.display = 'flex';
        this.isVisible = true;
        this.inputBox.focus();
        this.loadHistory();
    }

    public hide(): void {
        this.dialogElement.style.display = 'none';
        this.isVisible = false;
    }

    private async loadHistory(): Promise<void> {
        try {
            const response = await curiousTreeApi.getHistory({});
            if (response.success && response.data?.data?.messages) {
                // 清空现有消息
                this.messagesContainer.innerHTML = '';
                // 加载历史消息
                response.data.data.messages.forEach(msg => {
                    // 显示用户问题
                    this.addMessage('user', msg.question);
                    // 显示AI回复
                    this.addMessage('assistant', msg.aiResponse);
                });
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
        }
    }

    public destroy(): void {
        this.dialogElement.remove();
    }
} 
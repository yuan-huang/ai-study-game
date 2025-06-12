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

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'curious-tree-button-container';
        inputContainer.appendChild(buttonContainer);

        // 创建发送按钮
        const sendButton = document.createElement('button');
        sendButton.className = 'curious-tree-send-button';
        sendButton.textContent = '发送';
        sendButton.style.cssText = `
            background-color: #2196F3;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            min-width: 60px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        `;
        sendButton.onclick = () => this.handleSend();
        buttonContainer.appendChild(sendButton);

        // 创建清空按钮
        const clearButton = document.createElement('button');
        clearButton.className = 'curious-tree-clear-button';
        clearButton.textContent = '清空';
        clearButton.style.cssText = `
            background-color: #f44336;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            min-width: 60px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        `;
        clearButton.onclick = () => this.handleClear();
        buttonContainer.appendChild(clearButton);

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
        
        // 添加用户消息
        this.addMessage('user', message);
        
        // 显示加载提示
        const loadingMessage = this.addMessage('assistant', '', true);
        let currentResponse = '';
        
        try {
            // 使用流式API发送消息
            await curiousTreeApi.chatStream(message, (chunk) => {
                currentResponse += chunk;
                loadingMessage.textContent = currentResponse;
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            });

            // 移除加载提示
            loadingMessage.remove();
            // 添加完整的AI回复
            this.addMessage('assistant', currentResponse);
            // 更新成长值
            await this.updateGrowthValue();
        } catch (error) {
            console.error('发送消息失败:', error);
            // 移除加载提示
            loadingMessage.remove();
            this.addMessage('assistant', '抱歉，我遇到了一些问题，请稍后再试。');
        }
    }

    private addMessage(role: 'user' | 'assistant', content: string, isLoading: boolean = false): HTMLDivElement {
        const messageDiv = document.createElement('div');
        messageDiv.className = `curious-tree-message curious-tree-message-${role}`;
        if (isLoading) {
            messageDiv.className += ' curious-tree-message-loading';
            // 添加SVG加载动画
            const loadingSvg = document.createElement('div');
            loadingSvg.className = 'loading-svg';
            loadingSvg.innerHTML = `
                <svg viewBox="0 0 50 50" class="loading-spinner">
                    <circle class="loading-circle" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
                </svg>
            `;
            messageDiv.appendChild(loadingSvg);
        } else {
            messageDiv.textContent = content;
        }
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        return messageDiv;
    }

    private async updateGrowthValue(): Promise<void> {
        try {
            const response = await curiousTreeApi.getGrowth();
            if (response.success && response.data) {
                // 触发自定义事件通知场景更新成长值
                const event = new CustomEvent('growthUpdated', {
                    detail: response.data
                });
                window.dispatchEvent(event);
            }
        } catch (error) {
            console.error('更新成长值失败:', error);
        }
    }

    public show(): void {
        this.dialogElement.style.display = 'flex';
        this.isVisible = true;
        this.inputBox.focus();
        this.loadHistory();
        // 显示对话框时也更新一次成长值
        this.updateGrowthValue();
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
                
                // 按时间戳正序排序消息（最早的在前）
                const sortedMessages = response.data.data.messages.sort((a, b) => {
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                });

                // 加载历史消息
                sortedMessages.forEach(msg => {
                    // 显示用户问题
                    this.addMessage('user', msg.question);
                    // 显示AI回复
                    this.addMessage('assistant', msg.aiResponse);
                });

                // 滚动到底部
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
        }
    }

    private async handleClear(): Promise<void> {
        try {
            const response = await curiousTreeApi.clearHistory();
            if (response.success) {
                // 清空消息容器
                this.messagesContainer.innerHTML = '';
                // 显示清空成功提示
                this.addMessage('assistant', '对话已清空');
            } else {
                this.addMessage('assistant', '清空对话失败，请稍后重试');
            }
        } catch (error) {
            console.error('清空对话失败:', error);
            this.addMessage('assistant', '清空对话失败，请稍后重试');
        }
    }

    public destroy(): void {
        this.dialogElement.remove();
    }
} 
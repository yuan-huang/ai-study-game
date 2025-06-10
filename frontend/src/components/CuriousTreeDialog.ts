import { Scene } from 'phaser';
import { curiousTreeApi } from '../api/curiousTree';

interface DialogConfig {
    scene: Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    onClose: () => void;
}

export class CuriousTreeDialog {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private inputBox: HTMLInputElement;
    private messagesContainer: HTMLDivElement;
    private isVisible: boolean = false;

    constructor(config: DialogConfig) {
        this.scene = config.scene;
        this.container = this.scene.add.container(config.x, config.y);

        // 创建对话框背景
        const background = this.scene.add.rectangle(0, 0, config.width, config.height, 0xffffff, 0.95)
            .setStrokeStyle(2, 0x4caf50);
        this.container.add(background);

        // 创建标题
        const title = this.scene.add.text(0, -config.height/2 + 30, '🌳 好奇树对话', {
            fontSize: '24px',
            color: '#2d5016',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(title);

        // 创建关闭按钮
        const closeButton = this.scene.add.rectangle(config.width/2 - 30, -config.height/2 + 30, 40, 40, 0xff0000, 0.8)
            .setInteractive({ useHandCursor: true });
        const closeText = this.scene.add.text(config.width/2 - 30, -config.height/2 + 30, 'X', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.container.add([closeButton, closeText]);

        // 创建HTML元素
        this.createHTMLElements(config);

        // 设置事件监听
        closeButton.on('pointerdown', () => {
            this.hide();
            config.onClose();
        });

        // 初始隐藏
        this.container.setVisible(false);
    }

    private createHTMLElements(config: DialogConfig): void {
        // 创建消息容器
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.style.position = 'absolute';
        this.messagesContainer.style.left = '50%';
        this.messagesContainer.style.top = '50%';
        this.messagesContainer.style.transform = 'translate(-50%, -50%)';
        this.messagesContainer.style.width = (config.width - 40) + 'px';
        this.messagesContainer.style.height = (config.height - 120) + 'px';
        this.messagesContainer.style.overflowY = 'auto';
        this.messagesContainer.style.padding = '10px';
        this.messagesContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        this.messagesContainer.style.borderRadius = '8px';
        document.body.appendChild(this.messagesContainer);

        // 创建输入框
        this.inputBox = document.createElement('input');
        this.inputBox.type = 'text';
        this.inputBox.placeholder = '输入你的问题...';
        this.inputBox.style.position = 'absolute';
        this.inputBox.style.left = '50%';
        this.inputBox.style.bottom = '20px';
        this.inputBox.style.transform = 'translateX(-50%)';
        this.inputBox.style.width = (config.width - 100) + 'px';
        this.inputBox.style.padding = '10px';
        this.inputBox.style.borderRadius = '20px';
        this.inputBox.style.border = '2px solid #4caf50';
        this.inputBox.style.outline = 'none';
        document.body.appendChild(this.inputBox);

        // 添加回车发送功能
        this.inputBox.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && this.inputBox.value.trim()) {
                await this.sendMessage(this.inputBox.value.trim());
                this.inputBox.value = '';
            }
        });

        // 初始隐藏HTML元素
        this.messagesContainer.style.display = 'none';
        this.inputBox.style.display = 'none';
    }

    private async sendMessage(message: string): Promise<void> {
        // 添加用户消息
        this.addMessage('user', message);

        try {
            // 发送消息到服务器
            const response = await curiousTreeApi.sendMessage(message);
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
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.maxWidth = '80%';
        messageDiv.style.wordWrap = 'break-word';

        if (role === 'user') {
            messageDiv.style.backgroundColor = '#e3f2fd';
            messageDiv.style.marginLeft = 'auto';
        } else {
            messageDiv.style.backgroundColor = '#f1f8e9';
            messageDiv.style.marginRight = 'auto';
        }

        messageDiv.textContent = content;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    public show(): void {
        this.container.setVisible(true);
        this.messagesContainer.style.display = 'block';
        this.inputBox.style.display = 'block';
        this.isVisible = true;
        this.loadHistory();
    }

    public hide(): void {
        this.container.setVisible(false);
        this.messagesContainer.style.display = 'none';
        this.inputBox.style.display = 'none';
        this.isVisible = false;
    }

    private async loadHistory(): Promise<void> {
        try {
            const response = await curiousTreeApi.getHistory();
            if (response.success && response.data) {
                // 清空现有消息
                this.messagesContainer.innerHTML = '';
                // 加载历史消息
                response.data.forEach(msg => {
                    this.addMessage(msg.role, msg.content);
                });
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
        }
    }

    public destroy(): void {
        this.container.destroy();
        this.messagesContainer.remove();
        this.inputBox.remove();
    }
} 
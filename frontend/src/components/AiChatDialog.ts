import { Scene } from 'phaser';

export interface AiChatDialogConfig {
    scene: Scene;
    x: number;
    y: number;
    width?: number;
    height?: number;
    onClose?: () => void;
}

export class AiChatDialog {
    private scene: Scene;
    private container!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Rectangle;
    private titleContainer!: Phaser.GameObjects.Container;
    private titleBg!: Phaser.GameObjects.Rectangle;
    private titleText!: Phaser.GameObjects.Text;
    private treeIcon!: Phaser.GameObjects.Text;
    private inputContainer!: Phaser.GameObjects.Container;
    private inputBackground!: Phaser.GameObjects.Rectangle;
    private inputElement!: HTMLInputElement;
    private submitButton!: Phaser.GameObjects.Rectangle;
    private submitButtonText!: Phaser.GameObjects.Text;
    private closeButton!: Phaser.GameObjects.Rectangle;
    private closeButtonText!: Phaser.GameObjects.Text;
    private chatArea!: Phaser.GameObjects.Rectangle;
    private scrollContainer!: Phaser.GameObjects.Container;
    private scrollMask!: Phaser.GameObjects.Graphics;

    private isSubmitting: boolean = false;
    private onCloseCallback?: () => void;
    private chatHistory: Array<{ type: 'user' | 'ai', message: string }> = [];
    private currentScrollY: number = 0;

    constructor(config: AiChatDialogConfig) {
        this.scene = config.scene;
        this.onCloseCallback = config.onClose;

        const width = config.width || 800;
        const height = config.height || 700;

        this.createDialog(config.x, config.y, width, height);
        this.createInputElement();
    }

    private createDialog(x: number, y: number, width: number, height: number): void {
        // 创建主容器
        this.container = this.scene.add.container(x, y);
        this.container.setDepth(1000);

        // 主背景 - 圆角矩形效果
        this.background = this.scene.add.rectangle(0, 0, width, height, 0xffffff, 0.98);
        this.background.setStrokeStyle(4, 0x4caf50);

        // 创建标题区域
        this.createTitleArea(width, height);

        // 创建聊天区域
        this.createChatArea(width, height);

        // 创建输入区域
        this.createInputArea(width, height);

        // 创建关闭按钮
        this.createCloseButton(width, height);

        // 初始欢迎消息
        this.addWelcomeMessage();

        // 添加到主容器
        this.container.add([
            this.background,
            this.titleContainer,
            this.chatArea,
            this.scrollContainer,
            this.inputContainer,
            this.closeButton,
            this.closeButtonText
        ]);

        // 绑定事件
        this.setupEvents();
    }

    private createTitleArea(width: number, height: number): void {
        this.titleContainer = this.scene.add.container(0, -height / 2 + 50);

        // 标题背景 - 渐变效果
        this.titleBg = this.scene.add.rectangle(0, 0, width - 40, 80, 0x66bb6a, 0.9);
        this.titleBg.setStrokeStyle(3, 0x4caf50);

        // 树图标
        this.treeIcon = this.scene.add.text(-60, 0, '🌳', {
            fontSize: '36px'
        }).setOrigin(0.5);

        // 标题文字
        this.titleText = this.scene.add.text(20, 0, '好奇树 AI 助手', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // 副标题
        const subtitleText = this.scene.add.text(20, 25, '探索知识的奥秘，让好奇心生根发芽', {
            fontSize: '14px',
            color: '#e8f5e8',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.titleContainer.add([this.titleBg, this.treeIcon, this.titleText, subtitleText]);
    }

    private createChatArea(width: number, height: number): void {
        // 聊天区域背景
        this.chatArea = this.scene.add.rectangle(0, -40, width - 60, height - 240, 0xf8f9fa);
        this.chatArea.setStrokeStyle(2, 0xe0e0e0);

        // 创建滚动容器
        this.scrollContainer = this.scene.add.container(0, -height / 2 + 140);

        // 设置遮罩
        this.scrollMask = this.scene.add.graphics();
        this.scrollMask.fillStyle(0xffffff);
        this.scrollMask.fillRect(-width / 2 + 30, -height / 2 + 140, width - 60, height - 240);
        this.scrollContainer.setMask(this.scrollMask.createGeometryMask());
    }

    private createInputArea(width: number, height: number): void {
        this.inputContainer = this.scene.add.container(0, height / 2 - 80);

        // 输入框背景 - 现代化设计
        this.inputBackground = this.scene.add.rectangle(-60, 0, width - 240, 60, 0xffffff);
        this.inputBackground.setStrokeStyle(3, 0x4caf50);

        // 发送按钮 - 圆形设计
        this.submitButton = this.scene.add.rectangle(width / 2 - 100, 0, 80, 60, 0x4caf50);
        this.submitButton.setStrokeStyle(3, 0x388e3c);
        this.submitButton.setInteractive({ useHandCursor: true });

        this.submitButtonText = this.scene.add.text(width / 2 - 100, 0, '🚀', {
            fontSize: '24px'
        }).setOrigin(0.5);

        this.inputContainer.add([this.inputBackground, this.submitButton, this.submitButtonText]);
    }

    private createCloseButton(width: number, height: number): void {
        this.closeButton = this.scene.add.rectangle(width / 2 - 35, -height / 2 + 35, 60, 60, 0xff5722, 0.9);
        this.closeButton.setStrokeStyle(3, 0xd32f2f);
        this.closeButton.setInteractive({ useHandCursor: true });

        this.closeButtonText = this.scene.add.text(width / 2 - 35, -height / 2 + 35, '✕', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private createInputElement(): void {
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.placeholder = '问问好奇树，探索未知的世界...';
        this.inputElement.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 450px;
            height: 50px;
            font-size: 16px;
            padding: 12px 20px;
            border: 2px solid #4caf50;
            border-radius: 25px;
            outline: none;
            font-family: Arial, sans-serif;
            background: #ffffff;
            box-shadow: 0 2px 10px rgba(76, 175, 80, 0.2);
            transition: all 0.3s ease;
            z-index: 10000;
            display: none;
        `;

        // 添加输入事件
        this.inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.submitQuestion();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                this.close();
            }
        });

        // 聚焦效果
        this.inputElement.addEventListener('focus', () => {
            this.inputElement.style.borderColor = '#2196f3';
            this.inputElement.style.boxShadow = '0 4px 20px rgba(33, 150, 243, 0.3)';
            this.inputBackground.setStrokeStyle(3, 0x2196f3);
        });

        this.inputElement.addEventListener('blur', () => {
            this.inputElement.style.borderColor = '#4caf50';
            this.inputElement.style.boxShadow = '0 2px 10px rgba(76, 175, 80, 0.2)';
            this.inputBackground.setStrokeStyle(3, 0x4caf50);
        });

        document.body.appendChild(this.inputElement);
    }

    private setupEvents(): void {
        // 输入框点击事件
        this.inputBackground.setInteractive();
        this.inputBackground.on('pointerdown', () => {
            this.focusInput();
        });

        // 提交按钮事件
        this.submitButton.on('pointerdown', () => {
            this.submitQuestion();
        });

        // 关闭按钮事件
        this.closeButton.on('pointerdown', () => {
            this.close();
        });

        // 按钮悬停效果
        this.addButtonHoverEffect(this.submitButton, this.submitButtonText, 1.1);
        this.addButtonHoverEffect(this.closeButton, this.closeButtonText, 1.05);
        this.addButtonHoverEffect(this.titleBg, null, 1.02);
    }

    private addButtonHoverEffect(
        button: Phaser.GameObjects.Rectangle,
        text: Phaser.GameObjects.Text | null,
        scale: number = 1.1
    ): void {
        button.on('pointerover', () => {
            const targets = text ? [button, text] : [button];
            this.scene.tweens.add({
                targets,
                scaleX: scale,
                scaleY: scale,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });

        button.on('pointerout', () => {
            const targets = text ? [button, text] : [button];
            this.scene.tweens.add({
                targets,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
    }

    private focusInput(): void {
        this.inputElement.focus();
    }

    private addWelcomeMessage(): void {
        const welcomeText = `🌱 欢迎来到好奇树！

我是你的智能学习伙伴，可以帮助你：

🔍 探索自然科学的奥秘
📚 解答各种学习问题  
🧠 培养批判性思维
🌟 激发无限好奇心

快问我任何你想知道的问题吧！让我们一起在知识的森林中成长～`;

        this.addMessageToChat('ai', welcomeText);
    }

    private addMessageToChat(type: 'user' | 'ai', message: string): void {
        this.chatHistory.push({ type, message });

        const isUser = type === 'user';
        const messageY = this.chatHistory.length * 100 - 50;

        const messageContainer = this.scene.add.container(0, messageY);

        if (isUser) {
            this.createUserMessage(messageContainer, message);
        } else {
            this.createAiMessage(messageContainer, message);
        }

        this.scrollContainer.add(messageContainer);
        this.scrollToBottom();
    }

    private createUserMessage(container: Phaser.GameObjects.Container, message: string): void {
        // 用户消息气泡 - 右侧，蓝色
        const bubble = this.scene.add.rectangle(180, 0, 400, 70, 0x2196f3, 0.9);
        bubble.setStrokeStyle(2, 0x1976d2);

        const messageText = this.scene.add.text(180, 0, message, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: 360 },
            align: 'left',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        // 用户头像
        const userIcon = this.scene.add.text(320, 0, '👤', {
            fontSize: '24px'
        }).setOrigin(0.5);

        // 调整气泡大小
        const textBounds = messageText.getBounds();
        bubble.setSize(Math.max(400, textBounds.width + 40), Math.max(70, textBounds.height + 20));

        container.add([bubble, messageText, userIcon]);
    }

    private createAiMessage(container: Phaser.GameObjects.Container, message: string): void {
        // AI消息气泡 - 左侧，绿色
        const bubble = this.scene.add.rectangle(-180, 0, 400, 70, 0x4caf50, 0.9);
        bubble.setStrokeStyle(2, 0x388e3c);

        const messageText = this.scene.add.text(-180, 0, message, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: 360 },
            align: 'left',
            fontFamily: 'Arial, sans-serif',
            lineSpacing: 6
        }).setOrigin(0.5);

        // AI头像（树图标）
        const aiIcon = this.scene.add.text(-320, 0, '🌳', {
            fontSize: '24px'
        }).setOrigin(0.5);

        // 调整气泡大小
        const textBounds = messageText.getBounds();
        bubble.setSize(Math.max(400, textBounds.width + 40), Math.max(70, textBounds.height + 20));

        container.add([bubble, messageText, aiIcon]);
    }

    private scrollToBottom(): void {
        const containerHeight = 360; // 可视区域高度
        const contentHeight = this.chatHistory.length * 100;

        if (contentHeight > containerHeight) {
            const targetY = -(contentHeight - containerHeight);
            this.scene.tweens.add({
                targets: this.scrollContainer,
                y: this.scrollContainer.y + (targetY - this.currentScrollY),
                duration: 500,
                ease: 'Power2'
            });
            this.currentScrollY = targetY;
        }
    }

    private async submitQuestion(): Promise<void> {
        const question = this.inputElement.value.trim();

        if (this.isSubmitting || question === '') {
            return;
        }

        // 添加用户消息
        this.addMessageToChat('user', question);
        this.inputElement.value = '';

        this.isSubmitting = true;
        this.submitButtonText.setText('⏳');

        // 添加思考中的提示
        this.addMessageToChat('ai', '🤔 好奇树正在思考中...');

        try {
            // 动态导入 AI API
            const { aiApi } = await import('../api/aiApi');
            const response = await aiApi.askQuestion(question);

            // 移除思考提示
            const lastMessage = this.scrollContainer.list[this.scrollContainer.list.length - 1];
            if (lastMessage) {
                lastMessage.destroy();
                this.chatHistory.pop();
            }

            if (response.success) {
                this.addMessageToChat('ai', response.answer);
            } else {
                this.addMessageToChat('ai', `🌿 抱歉，好奇树遇到了一些问题：${response.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('提问失败:', error);
            // 移除思考提示
            const lastMessage = this.scrollContainer.list[this.scrollContainer.list.length - 1];
            if (lastMessage) {
                lastMessage.destroy();
                this.chatHistory.pop();
            }
            this.addMessageToChat('ai', '🍃 抱歉，好奇树暂时无法回答，请稍后再试。');
        } finally {
            this.isSubmitting = false;
            this.submitButtonText.setText('🚀');
        }
    }

    private updateInputPosition(): void {
        const canvas = this.scene.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;

        const worldX = this.container.x - 60;
        const worldY = this.container.y + 270;

        const screenX = canvasRect.left + (worldX / scaleX);
        const screenY = canvasRect.top + (worldY / scaleY);

        this.inputElement.style.left = screenX + 'px';
        this.inputElement.style.top = screenY + 'px';
    }

    public show(): void {
        this.container.setVisible(true);
        this.container.setAlpha(0);
        this.container.setScale(0.8);

        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.inputElement.style.display = 'block';
                this.updateInputPosition();
                setTimeout(() => {
                    this.focusInput();
                }, 100);
            }
        });
    }

    public hide(): void {
        this.inputElement.style.display = 'none';

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.container.setVisible(false);
            }
        });
    }

    public close(): void {
        this.hide();
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    public destroy(): void {
        if (this.inputElement && this.inputElement.parentNode) {
            this.inputElement.parentNode.removeChild(this.inputElement);
        }
        this.container.destroy();
    }
} 
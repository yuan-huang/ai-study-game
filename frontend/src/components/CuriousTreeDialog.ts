import { Scene } from 'phaser';

export interface CuriousTreeDialogConfig {
    scene: Scene;
    x: number;
    y: number;
    width?: number;
    height?: number;
    onClose?: () => void;
}

export class CuriousTreeDialog {
    private scene: Scene;
    private container!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Rectangle;
    private titleText!: Phaser.GameObjects.Text;
    private growthBar!: Phaser.GameObjects.Rectangle;
    private growthBarBg!: Phaser.GameObjects.Rectangle;
    private growthText!: Phaser.GameObjects.Text;
    private inputElement!: HTMLTextAreaElement;
    private submitButton!: Phaser.GameObjects.Rectangle;
    private submitButtonText!: Phaser.GameObjects.Text;
    private closeButton!: Phaser.GameObjects.Rectangle;
    private responseArea!: Phaser.GameObjects.Rectangle;
    private scrollContainer!: Phaser.GameObjects.Container;
    private chatHistory: Array<{ type: 'user' | 'ai', message: string }> = [];

    private isSubmitting: boolean = false;
    private onCloseCallback?: () => void;
    private currentGrowth: number = 0;
    private maxGrowth: number = 100;

    constructor(config: CuriousTreeDialogConfig) {
        this.scene = config.scene;
        this.onCloseCallback = config.onClose;

        const width = config.width || 900;
        const height = config.height || 700;

        this.loadGrowthData();
        this.createDialog(config.x, config.y, width, height);
        this.createInputElement();
    }

    private async loadGrowthData(): Promise<void> {
        try {
            // 获取或创建用户ID
            let userId = localStorage.getItem('curiousTreeUserId');
            if (!userId) {
                userId = 'curious_user_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('curiousTreeUserId', userId);
            }

            // 从API获取成长值
            const response = await fetch(`/api/growth/${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    this.currentGrowth = data.data.currentGrowth;
                    this.maxGrowth = data.data.maxGrowth;
                }
            } else {
                // 后备方案：从localStorage获取
                const savedGrowth = localStorage.getItem('curiousTreeGrowth');
                this.currentGrowth = savedGrowth ? parseInt(savedGrowth) : 0;
            }
        } catch (error) {
            console.error('加载成长值失败:', error);
            // 后备方案：从localStorage获取
            const savedGrowth = localStorage.getItem('curiousTreeGrowth');
            this.currentGrowth = savedGrowth ? parseInt(savedGrowth) : 0;
        }
    }

    private createDialog(x: number, y: number, width: number, height: number): void {
        // 创建主容器
        this.container = this.scene.add.container(x, y);
        this.container.setDepth(1000);

        // 主背景 - 渐变效果
        this.background = this.scene.add.rectangle(0, 0, width, height, 0xffffff, 0.98);
        this.background.setStrokeStyle(5, 0x4caf50);

        // 创建头部区域
        this.createHeaderArea(width, height);

        // 创建成长值显示
        this.createGrowthDisplay(width, height);

        // 创建聊天区域
        this.createChatArea(width, height);

        // 创建输入区域
        this.createInputArea(width, height);

        // 创建关闭按钮
        this.createCloseButton(width, height);

        // 初始欢迎消息
        this.addWelcomeMessage();

        // 添加到容器
        this.container.add([
            this.background,
            this.titleText,
            this.growthBarBg,
            this.growthBar,
            this.growthText,
            this.submitButton,
            this.submitButtonText,
            this.closeButton,
            this.responseArea,
            this.scrollContainer
        ]);

        // 绑定事件
        this.setupEvents();
    }

    private createHeaderArea(width: number, height: number): void {
        // 大标题
        this.titleText = this.scene.add.text(0, -height / 2 + 50, '🌳 好奇树的成长花园', {
            fontSize: '36px',
            color: '#2d5016',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
    }

    private createGrowthDisplay(width: number, height: number): void {
        // 成长值背景条
        this.growthBarBg = this.scene.add.rectangle(0, -height / 2 + 110, width - 100, 25, 0xe0e0e0);
        this.growthBarBg.setStrokeStyle(2, 0xcccccc);

        // 成长值进度条
        const progress = this.currentGrowth / this.maxGrowth;
        this.growthBar = this.scene.add.rectangle(
            -(width - 100) / 2 + (width - 100) * progress / 2,
            -height / 2 + 110,
            (width - 100) * progress,
            25,
            0x4caf50
        );

        // 成长值文字
        this.growthText = this.scene.add.text(0, -height / 2 + 140,
            `🌱 当前成长值: ${this.currentGrowth}/${this.maxGrowth} - 每次提问和思考都会让好奇树成长哦！`, {
            fontSize: '16px',
            color: '#4a7c59',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }

    private createChatArea(width: number, height: number): void {
        // 聊天区域背景
        this.responseArea = this.scene.add.rectangle(0, -30, width - 80, height - 320, 0xf8f9fa);
        this.responseArea.setStrokeStyle(3, 0xe0e0e0);

        // 创建滚动容器
        this.scrollContainer = this.scene.add.container(0, -height / 2 + 200);

        // 创建遮罩以确保文字不会超出聊天区域
        const mask = this.scene.add.graphics();
        mask.fillStyle(0xffffff);
        mask.fillRect(-(width - 80) / 2, -height / 2 + 85, width - 80, height - 320);
        this.scrollContainer.setMask(mask.createGeometryMask());
    }

    private createInputArea(width: number, height: number): void {
        // 提交按钮 - 更大更醒目
        this.submitButton = this.scene.add.rectangle(width / 2 - 100, height / 2 - 60, 150, 60, 0x4caf50);
        this.submitButton.setStrokeStyle(4, 0x388e3c);
        this.submitButton.setInteractive({ useHandCursor: true });

        this.submitButtonText = this.scene.add.text(width / 2 - 100, height / 2 - 60, '🚀 向好奇树提问', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }

    private createCloseButton(width: number, height: number): void {
        this.closeButton = this.scene.add.rectangle(width / 2 - 40, -height / 2 + 40, 70, 70, 0xff5722, 0.9);
        this.closeButton.setStrokeStyle(4, 0xd32f2f);
        this.closeButton.setInteractive({ useHandCursor: true });

        const closeButtonText = this.scene.add.text(width / 2 - 40, -height / 2 + 40, '✕', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.container.add(closeButtonText);
    }

    private createInputElement(): void {
        this.inputElement = document.createElement('textarea');
        this.inputElement.placeholder = '🌱 告诉好奇树你想了解什么吧！可以问任何让你好奇的问题...';

        // 设置样式属性
        Object.assign(this.inputElement.style, {
            position: 'fixed',
            left: '50%',
            bottom: '100px',
            transform: 'translateX(-50%)',
            width: '650px',
            height: '80px',
            fontSize: '18px',
            padding: '15px 25px',
            border: '4px solid #4caf50',
            borderRadius: '20px',
            outline: 'none',
            fontFamily: 'Arial, sans-serif',
            background: '#ffffff',
            boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
            resize: 'none',
            lineHeight: '1.4',
            zIndex: '10001',
            display: 'none',
            visibility: 'hidden'
        });

        // 添加输入事件
        this.inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
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
            this.inputElement.style.boxShadow = '0 8px 25px rgba(33, 150, 243, 0.4)';
        });

        this.inputElement.addEventListener('blur', () => {
            this.inputElement.style.borderColor = '#4caf50';
            this.inputElement.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.3)';
        });

        document.body.appendChild(this.inputElement);

        // 添加调试信息
        console.log('输入框已创建并添加到DOM:', this.inputElement);
        console.log('输入框样式:', this.inputElement.style.cssText);
    }

    private setupEvents(): void {
        // 提交按钮事件
        this.submitButton.on('pointerdown', () => {
            // 如果输入框有内容，提交问题；否则聚焦输入框
            if (this.inputElement.value.trim()) {
                this.submitQuestion();
            } else {
                this.inputElement.focus();
            }
        });

        // 关闭按钮事件
        this.closeButton.on('pointerdown', () => {
            this.close();
        });

        // 按钮悬停效果
        this.addButtonHoverEffect(this.submitButton, this.submitButtonText);
        this.addButtonHoverEffect(this.closeButton, null);
    }

    private addButtonHoverEffect(
        button: Phaser.GameObjects.Rectangle,
        text: Phaser.GameObjects.Text | null
    ): void {
        button.on('pointerover', () => {
            const targets = text ? [button, text] : [button];
            this.scene.tweens.add({
                targets,
                scaleX: 1.1,
                scaleY: 1.1,
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

    private addWelcomeMessage(): void {
        // 分段显示欢迎消息，避免文字过长
        const welcomeMessages = [
            '🌱 欢迎来到好奇树的成长花园！',
            '我是一棵充满智慧的古老大树，最喜欢和好奇的小朋友们一起探索世界的奥秘！',
            '🎉 每当你提出有趣的问题或深入思考时，我就会茁壮成长！',
            '快在下方告诉我你最好奇的事情吧！让我们一起在知识的森林中快乐成长～🌳✨'
        ];

        welcomeMessages.forEach((message, index) => {
            setTimeout(() => {
                this.addMessageToChat('ai', message);
            }, index * 800);
        });
    }

    private addMessageToChat(type: 'user' | 'ai', message: string): void {
        this.chatHistory.push({ type, message });

        const isUser = type === 'user';
        const messageY = this.chatHistory.length * 120 - 50;

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
        const maxWidth = 380;

        const messageText = this.scene.add.text(0, 0, message, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: maxWidth - 40 },
            align: 'left',
            fontFamily: 'Arial, sans-serif',
            lineSpacing: 4
        });

        const textBounds = messageText.getBounds();
        const bubbleWidth = Math.min(maxWidth, Math.max(200, textBounds.width + 40));
        const bubbleHeight = Math.max(60, textBounds.height + 20);

        const bubble = this.scene.add.rectangle(200, 0, bubbleWidth, bubbleHeight, 0x2196f3, 0.9);
        bubble.setStrokeStyle(3, 0x1976d2);

        messageText.setPosition(200, 0).setOrigin(0.5);

        // 用户头像
        const userIcon = this.scene.add.text(350, 0, '👧', {
            fontSize: '28px'
        }).setOrigin(0.5);

        container.add([bubble, messageText, userIcon]);
    }

    private createAiMessage(container: Phaser.GameObjects.Container, message: string): void {
        // AI消息气泡 - 左侧，绿色
        const maxWidth = 380;

        const messageText = this.scene.add.text(0, 0, message, {
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: maxWidth - 40 },
            align: 'left',
            fontFamily: 'Arial, sans-serif',
            lineSpacing: 6
        });

        const textBounds = messageText.getBounds();
        const bubbleWidth = Math.min(maxWidth, Math.max(200, textBounds.width + 40));
        const bubbleHeight = Math.max(60, textBounds.height + 20);

        const bubble = this.scene.add.rectangle(-200, 0, bubbleWidth, bubbleHeight, 0x4caf50, 0.9);
        bubble.setStrokeStyle(3, 0x388e3c);

        messageText.setPosition(-200, 0).setOrigin(0.5);

        // AI头像（树图标）
        const aiIcon = this.scene.add.text(-350, 0, '🌳', {
            fontSize: '28px'
        }).setOrigin(0.5);

        container.add([bubble, messageText, aiIcon]);
    }

    private scrollToBottom(): void {
        const containerHeight = 320; // 可视区域高度
        const contentHeight = this.chatHistory.length * 120;

        if (contentHeight > containerHeight) {
            const targetY = -(contentHeight - containerHeight);
            this.scene.tweens.add({
                targets: this.scrollContainer,
                y: targetY,
                duration: 500,
                ease: 'Power2'
            });
        }
    }

    private async submitQuestion(): Promise<void> {
        const question = this.inputElement.value.trim();

        if (this.isSubmitting || question === '') {
            this.showMessage('🌿 请告诉好奇树你想了解什么吧！');
            return;
        }

        // 添加用户消息
        this.addMessageToChat('user', question);
        this.inputElement.value = '';

        this.isSubmitting = true;
        this.submitButtonText.setText('⏳ 好奇树在思考...');

        // 添加思考中的提示
        this.addMessageToChat('ai', '🤔 好奇树正在仔细思考你的问题...');

        try {
            // 调用智能评分和回答API
            const response = await fetch('/api/ai/smart-ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            const data = await response.json();

            // 移除思考提示
            const lastMessage = this.scrollContainer.list[this.scrollContainer.list.length - 1];
            if (lastMessage) {
                lastMessage.destroy();
                this.chatHistory.pop();
            }

            if (data.success) {
                this.addMessageToChat('ai', `🌳 ${data.answer}`);

                // 使用智能评分系统给予奖励
                if (data.score && data.score > 0) {
                    await this.awardGrowth(data.score, data.scoreReason || '好问题奖励');
                }
            } else {
                this.addMessageToChat('ai', `🍃 抱歉，好奇树遇到了一些问题：${data.error || '未知错误'}`);
                // 即使失败也给一点鼓励分
                await this.awardGrowth(2, '勇敢提问奖励');
            }

        } catch (error) {
            console.error('提问失败:', error);
            // 移除思考提示
            const lastMessage = this.scrollContainer.list[this.scrollContainer.list.length - 1];
            if (lastMessage) {
                lastMessage.destroy();
                this.chatHistory.pop();
            }
            this.addMessageToChat('ai', '🍂 好奇树暂时听不清你的话，但你的好奇心让我很开心！请稍后再试吧～');
            // 给予安慰奖励
            await this.awardGrowth(1, '坚持尝试奖励');
        } finally {
            this.isSubmitting = false;
            this.submitButtonText.setText('🚀 向好奇树提问');
        }
    }

    private async awardGrowth(points: number, message: string): Promise<void> {
        this.currentGrowth += points;

        // 保存到localStorage
        localStorage.setItem('curiousTreeGrowth', this.currentGrowth.toString());

        // 更新成长条显示
        this.updateGrowthDisplay();

        // 显示奖励消息
        this.showGrowthReward(`🎉 ${message} +${points} 成长值！`);

        // 检查是否需要升级
        if (this.currentGrowth >= this.maxGrowth) {
            this.triggerLevelUp();
        }

        // 同步到数据库
        try {
            await this.saveGrowthToDatabase(points, message);
        } catch (error) {
            console.error('保存成长值到数据库失败:', error);
        }
    }

    private updateGrowthDisplay(): void {
        const progress = Math.min(this.currentGrowth / this.maxGrowth, 1);
        const barWidth = 800; // 成长条总宽度

        // 更新成长条
        this.growthBar.setSize(barWidth * progress, 25);
        this.growthBar.x = -(barWidth) / 2 + (barWidth * progress) / 2;

        // 更新文字
        this.growthText.setText(`🌱 当前成长值: ${this.currentGrowth}/${this.maxGrowth} - 每次提问和思考都会让好奇树成长哦！`);

        // 成长条动画
        this.scene.tweens.add({
            targets: this.growthBar,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }

    private showGrowthReward(message: string): void {
        const rewardText = this.scene.add.text(
            this.container.x,
            this.container.y - 200,
            message,
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: 'rgba(76, 175, 80, 0.9)',
                padding: { x: 20, y: 12 },
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setDepth(1100);

        // 奖励动画
        this.scene.tweens.add({
            targets: rewardText,
            y: rewardText.y - 50,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 2500,
            ease: 'Power2',
            onComplete: () => {
                rewardText.destroy();
            }
        });

        // 添加闪烁效果
        const sparkles = [];
        for (let i = 0; i < 6; i++) {
            const sparkle = this.scene.add.text(
                this.container.x + (Math.random() - 0.5) * 200,
                this.container.y - 200 + (Math.random() - 0.5) * 100,
                '✨',
                { fontSize: '20px' }
            ).setDepth(1101);

            sparkles.push(sparkle);

            this.scene.tweens.add({
                targets: sparkle,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 1500,
                delay: i * 200,
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }
    }

    private triggerLevelUp(): void {
        this.currentGrowth = 0;
        this.maxGrowth += 20; // 每次升级增加难度

        this.showMessage('🎊 恭喜！好奇树长大了一圈！获得特殊奖励！', 4000);

        // 升级特效
        this.scene.tweens.add({
            targets: this.titleText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 300,
            yoyo: true,
            repeat: 2,
            ease: 'Power2'
        });
    }

    private async saveGrowthToDatabase(points: number, reason: string): Promise<void> {
        try {
            const userId = localStorage.getItem('curiousTreeUserId') || 'anonymous_user';

            const response = await fetch('/api/growth/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    points,
                    reason
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // 同步服务器端的数据
                    this.currentGrowth = data.data.currentGrowth;
                    this.maxGrowth = data.data.maxGrowth;

                    if (data.message && data.message.includes('升级')) {
                        this.triggerLevelUp();
                    }
                }
            }
        } catch (error) {
            console.error('保存成长值到数据库失败:', error);
        }
    }

    private showMessage(text: string, duration: number = 2000): void {
        const message = this.scene.add.text(
            this.container.x,
            this.container.y + 300,
            text,
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 87, 34, 0.9)',
                padding: { x: 20, y: 12 },
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setDepth(1100);

        // 淡出动画
        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 40,
            duration,
            ease: 'Power2',
            onComplete: () => {
                message.destroy();
            }
        });
    }

    private updateInputPosition(): void {
        // 简化定位逻辑，使用固定的居中定位
        this.inputElement.style.position = 'fixed';
        this.inputElement.style.left = '50%';
        this.inputElement.style.bottom = '100px'; // 距离底部固定距离
        this.inputElement.style.transform = 'translateX(-50%)';
        this.inputElement.style.zIndex = '10001'; // 确保在最顶层
    }

    private showInputElement(): void {
        // 显示输入框
        this.inputElement.style.display = 'block';
        this.inputElement.style.visibility = 'visible';
        this.inputElement.style.opacity = '1';
        this.inputElement.style.pointerEvents = 'auto';

        this.updateInputPosition();

        // 调试输出
        console.log('🌳 好奇树输入框状态:');
        console.log('- 显示状态:', this.inputElement.style.display);
        console.log('- 可见性:', this.inputElement.style.visibility);
        console.log('- 透明度:', this.inputElement.style.opacity);
        console.log('- z-index:', this.inputElement.style.zIndex);
        console.log('- DOM元素是否存在:', !!this.inputElement);
        console.log('- 是否在DOM中:', document.body.contains(this.inputElement));

        // 创建一个临时的可见指示器
        const indicator = document.createElement('div');
        indicator.textContent = '👆 输入框应该在这里！如果看不到请检查浏览器';
        Object.assign(indicator.style, {
            position: 'fixed',
            left: '50%',
            bottom: '30px',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 0, 0, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '10px',
            zIndex: '10002',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '400px',
            wordWrap: 'break-word'
        });
        document.body.appendChild(indicator);

        // 5秒后移除指示器
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 5000);

        // 聚焦输入框
        setTimeout(() => {
            try {
                this.inputElement.focus();
                console.log('✅ 输入框已聚焦');
            } catch (error) {
                console.error('❌ 聚焦输入框失败:', error);
            }
        }, 500);
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
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 显示输入框
                this.showInputElement();

                // 监听窗口大小变化
                window.addEventListener('resize', this.updateInputPosition.bind(this));
            }
        });
    }

    public hide(): void {
        if (this.inputElement) {
            this.inputElement.style.display = 'none';
            this.inputElement.style.visibility = 'hidden';
            this.inputElement.blur(); // 移除焦点
        }

        // 移除窗口大小变化监听
        window.removeEventListener('resize', this.updateInputPosition.bind(this));

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 400,
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
        // 确保移除输入框元素
        if (this.inputElement && this.inputElement.parentNode) {
            this.inputElement.parentNode.removeChild(this.inputElement);
        }

        // 移除事件监听
        window.removeEventListener('resize', this.updateInputPosition.bind(this));

        // 销毁Phaser容器
        if (this.container) {
            this.container.destroy();
        }
    }
} 
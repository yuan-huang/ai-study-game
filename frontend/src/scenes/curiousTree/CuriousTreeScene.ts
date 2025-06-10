import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';
import { CuriousTreeDialog } from '@/components/CuriousTreeDialog';

export class CuriousTreeScene extends BaseScene {
    private curiousTreeDialog?: CuriousTreeDialog;
    private growthText?: Phaser.GameObjects.Text;

    constructor() {
        super('CuriousTreeScene');
    }

    preload(): void {
        super.preload();
        // 加载好奇树背景
        this.load.image('curious-tree-bg', getAssetPath('curious-tree-bg'));

        // 加载好奇树背景音乐
        this.load.audio('curious-tree-bgm', getAssetPath('curious-tree-bgm'));
    }

    create(): void {
        super.create();

        // 设置背景图片，填满整个屏幕
        const background = this.add.image(0, 0, 'curious-tree-bg').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        background.setDepth(0);

        // 添加标题
        this.add.text(
            this.cameras.main.width / 2,
            80,
            '🌳 好奇之树',
            {
                fontSize: '48px',
                color: '#2d5016',
                fontStyle: 'bold',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(100);

        // 添加描述文本
        this.add.text(
            this.cameras.main.width / 2,
            150,
            '探索自然的奥秘，培养好奇心',
            {
                fontSize: '24px',
                color: '#4a7c59',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setDepth(100);

        // 添加成长值显示
        this.loadAndDisplayGrowth();

        // 添加返回按钮
        this.createBackButton();

        // 添加功能按钮区域
        this.createFunctionButtons();

        // 播放好奇树背景音乐
        this.sound.play('curious-tree-bgm', {
            loop: true,
            volume: 0.5
        });
    }

    /**
     * 创建返回按钮
     */
    private createBackButton(): void {
        const backButton = this.add.rectangle(
            80, 50, 120, 50, 0x4caf50, 1
        ).setStrokeStyle(3, 0x388e3c);

        const backText = this.add.text(80, 50, '🏠 返回', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 设置交互
        backButton.setInteractive({ useHandCursor: true });
        backButton.on('pointerdown', () => {
            this.scene.start('MainScene');
        });

        // 悬停效果
        backButton.on('pointerover', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        backButton.on('pointerout', () => {
            this.tweens.add({
                targets: [backButton, backText],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        // 设置深度
        backButton.setDepth(100);
        backText.setDepth(101);
    }

    /**
     * 创建功能按钮
     */
    private createFunctionButtons(): void {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // 只保留一个好奇树按钮
        this.createFunctionButton(
            centerX, centerY,
            '🌳 好奇树',
            0x4caf50,
            () => {
                this.openAiDialog();
            }
        );
    }

    /**
     * 创建功能按钮
     */
    private createFunctionButton(
        x: number,
        y: number,
        text: string,
        color: number,
        callback: () => void
    ): void {
        const button = this.add.rectangle(x, y, 180, 80, color, 1)
            .setStrokeStyle(3, this.adjustColorBrightness(color, -0.2))
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // 点击事件
        button.on('pointerdown', callback);

        // 悬停效果
        button.on('pointerover', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        button.on('pointerout', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
        });

        // 设置深度
        button.setDepth(100);
        buttonText.setDepth(101);
    }

    /**
     * 调整颜色亮度
     */
    private adjustColorBrightness(color: number, amount: number): number {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        const newR = Math.max(0, Math.min(255, r + amount * 255));
        const newG = Math.max(0, Math.min(255, g + amount * 255));
        const newB = Math.max(0, Math.min(255, b + amount * 255));

        return (newR << 16) | (newG << 8) | newB;
    }

    /**
     * 显示消息
     */
    private showMessage(text: string): void {
        const message = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            text,
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(1000);

        // 淡出动画
        this.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                message.destroy();
            }
        });
    }

    /**
     * 打开好奇树对话框
     */
    private openAiDialog(): void {
        if (this.curiousTreeDialog) {
            this.curiousTreeDialog.destroy();
        }

        this.curiousTreeDialog = new CuriousTreeDialog({
            scene: this,
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            width: 900,
            height: 700,
            onClose: () => {
                this.curiousTreeDialog = undefined;
            }
        });

        this.curiousTreeDialog.show();
    }

    /**
     * 加载并显示成长值
     */
    private async loadAndDisplayGrowth(): Promise<void> {
        try {
            const userId = localStorage.getItem('curiousTreeUserId') || 'anonymous_user';
            const response = await fetch(`/api/growth/${userId}`);

            let growthData = { currentGrowth: 0, maxGrowth: 100, level: 1 };

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    growthData = data.data;
                }
            }

            // 显示成长值信息
            this.growthText = this.add.text(
                this.cameras.main.width / 2,
                200,
                `🌱 好奇树等级: ${growthData.level} | 成长值: ${growthData.currentGrowth}/${growthData.maxGrowth}`,
                {
                    fontSize: '20px',
                    color: '#4a7c59',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: { x: 15, y: 8 },
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5).setDepth(100);

            // 添加动画效果
            this.tweens.add({
                targets: this.growthText,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

        } catch (error) {
            console.error('加载成长值失败:', error);

            // 显示默认信息
            this.growthText = this.add.text(
                this.cameras.main.width / 2,
                200,
                '🌱 开始你的好奇之旅吧！',
                {
                    fontSize: '20px',
                    color: '#4a7c59',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: { x: 15, y: 8 },
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5).setDepth(100);
        }
    }

    update(time: number, delta: number): void {
        super.update(time, delta);
    }
} 
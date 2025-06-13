import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';
import { CuriousTreeDialog } from '@/components/CuriousTreeDialog';
import { curiousTreeApi, GrowthData } from '@/api/curiousTreeApi';
import { gameEvents } from '@/utils/gameEvents';

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
        // 添加背景
        this.createBackground('curious-tree-bg');

        // 添加标题
        this.createText(
            this.cameras.main.width / 2,
            80,
            '🌳 好奇之树',
            'TITLE_LARGE',
            {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(100);

        // 添加描述文本
        this.createText(
            this.cameras.main.width / 2,
            150,
            '探索自然的奥秘，培养好奇心',
            'TITLE_MEDIUM',
            {
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setDepth(100);

        // 添加返回按钮
        this.createBackButton();

        // 创建功能按钮
        this.createFunctionButtons();

        // 加载并显示成长值
        this.loadAndDisplayGrowth();

        // 添加事件监听
        window.addEventListener('growthUpdated', this.handleGrowthUpdate as EventListener);

        // 播放好奇树背景音乐
        this.audioManager.playMusic(this, 'curious-tree-bgm', {
            loop: true
        });
    }

    private handleGrowthUpdate = (event: Event) => {
        // 处理成长值更新事件
        this.loadAndDisplayGrowth();
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
        // 使用蓝色系
        const buttonColor = 0x2196F3; // Material Design 蓝色
        const glowColor = 0x64B5F6;   // 浅蓝色用于发光效果

        // 添加圆角效果
        const radius = 20;
        const graphics = this.add.graphics();
        graphics.fillStyle(buttonColor, 1);
        graphics.fillRoundedRect(-90, -40, 180, 80, radius);
        graphics.lineStyle(3, this.adjustColorBrightness(buttonColor, -0.2), 1);
        graphics.strokeRoundedRect(-90, -40, 180, 80, radius);

        // 创建发光效果层
        const glowGraphics = this.add.graphics();
        glowGraphics.fillStyle(glowColor, 0);
        glowGraphics.fillRoundedRect(-90, -40, 180, 80, radius);

        // 创建容器来组合图形和文本
        const container = this.add.container(x, y, [glowGraphics, graphics]);

        // 创建交互区域
        const hitArea = new Phaser.Geom.Rectangle(-90, -40, 180, 80);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        if (container.input) {
            container.input.cursor = 'pointer';  // 只在这里设置指针样式
        }

        const buttonText = this.createText(x, y, text, 'BUTTON_TEXT', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        // 添加发光动画
        this.tweens.add({
            targets: glowGraphics,
            alpha: 0.3,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 点击事件
        container.on('pointerdown', callback);

        // 悬停效果
        container.on('pointerover', () => {
            this.tweens.add({
                targets: [container, buttonText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Power2'
            });
            // 增强发光效果
            this.tweens.add({
                targets: glowGraphics,
                alpha: 0.5,
                duration: 200,
                ease: 'Power2'
            });
        });

        container.on('pointerout', () => {
            this.tweens.add({
                targets: [container, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Power2'
            });
            // 恢复发光效果
            this.tweens.add({
                targets: glowGraphics,
                alpha: 0,
                duration: 200,
                ease: 'Power2'
            });
        });

        // 设置深度
        container.setDepth(100);
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

        // 显示遮罩层
        gameEvents.emit('overlay:show');

        this.curiousTreeDialog = new CuriousTreeDialog({
            scene: this,
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            width: 900,
            height: 700,
            onClose: () => {
                // 关闭遮罩层
                gameEvents.emit('overlay:hide');
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
            const response = await curiousTreeApi.getGrowth();
            let growthData: GrowthData = { growthValue: 0, level: 1 };

            if (response.success && response.data) {
                growthData = response.data;
            }

            // 显示成长值信息
            this.growthText = this.add.text(
                this.cameras.main.width / 2,
                200,
                `🌱 好奇树等级: ${growthData.level} | 成长值: ${growthData.growthValue}/100`,
                {
                    fontSize: '32px',
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

    shutdown(): void {
        // 移除事件监听
        window.removeEventListener('growthUpdated', this.handleGrowthUpdate as EventListener);

        super.shutdown();
    }
} 
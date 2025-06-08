import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';

export class CuriousTreeScene extends BaseScene {
    constructor() {
        super('CuriousTreeScene');
    }

    preload(): void {
        super.preload();
        // 加载好奇树背景
        this.load.image('curious-tree-bg', getAssetPath('curious-tree'));

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
        
        // 探索自然按钮
        this.createFunctionButton(
            centerX - 200, centerY, 
            '🔍 探索自然', 
            0x4caf50,
            () => {
                console.log('开始探索自然');
                // TODO: 实现探索自然的功能
                this.showMessage('探索自然功能即将开放！');
            }
        );
        
        // 科学实验按钮
        this.createFunctionButton(
            centerX, centerY,
            '🧪 科学实验',
            0x2196f3,
            () => {
                console.log('开始科学实验');
                // TODO: 实现科学实验功能
                this.showMessage('科学实验功能即将开放！');
            }
        );
        
        // 知识问答按钮
        this.createFunctionButton(
            centerX + 200, centerY,
            '❓ 知识问答',
            0xff9800,
            () => {
                console.log('开始知识问答');
                // TODO: 实现知识问答功能
                this.showMessage('知识问答功能即将开放！');
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
    
    update(time: number, delta: number): void {
        super.update(time, delta);
    }
} 
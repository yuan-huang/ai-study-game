import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';

export class GardenScene extends BaseScene {
    constructor() {
        super('GardenScene');
    }

    preload(): void {
        super.preload();
        // 加载花园背景
        this.load.image('garden-bg', getAssetPath('garden'));
        
        // 加载花朵资源
        this.load.image('flower-chinese', getAssetPath('flower-chinese'));
        this.load.image('flower-math', getAssetPath('flower-math'));
        this.load.image('flower-english', getAssetPath('flower-english'));
        this.load.image('flower-technology', getAssetPath('flower-technology'));
        this.load.image('flower-marine', getAssetPath('flower-marine'));
    }

    create(): void {
        super.create();
        
        // 设置背景图片，填满整个屏幕
        const background = this.add.image(0, 0, 'garden-bg').setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        background.setDepth(0);
        
        // 添加标题
        this.add.text(
            this.cameras.main.width / 2, 
            80, 
            '🌺 知识花园', 
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
            '种植知识之花，收获智慧果实',
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
        
        // 添加示例花朵展示
        this.createFlowerShowcase();
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
        const centerY = this.cameras.main.height / 2 + 50;
        
        // 种植花朵按钮
        this.createFunctionButton(
            centerX - 150, centerY, 
            '🌱 种植花朵', 
            0x4caf50,
            () => {
                console.log('开始种植花朵');
                this.showMessage('种植花朵功能即将开放！');
            }
        );
        
        // 花园管理按钮
        this.createFunctionButton(
            centerX, centerY,
            '🛠️ 花园管理',
            0x2196f3,
            () => {
                console.log('开始花园管理');
                this.showMessage('花园管理功能即将开放！');
            }
        );
        
        // 记忆状态按钮
        this.createFunctionButton(
            centerX + 150, centerY,
            '🧠 记忆状态',
            0xff9800,
            () => {
                console.log('查看记忆状态');
                this.showMessage('记忆状态功能即将开放！');
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
        const button = this.add.rectangle(x, y, 150, 70, color, 1)
            .setStrokeStyle(3, this.adjustColorBrightness(color, -0.2))
            .setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            fontSize: '16px',
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
     * 创建花朵展示区域
     */
    private createFlowerShowcase(): void {
        const showcaseY = this.cameras.main.height - 200;
        const flowers = [
            { key: 'flower-chinese', name: '语文花', color: 0xff4444 },
            { key: 'flower-math', name: '数学花', color: 0x4444ff },
            { key: 'flower-english', name: '英语花', color: 0x44ff44 },
            { key: 'flower-technology', name: '科技花', color: 0xff8800 },
            { key: 'flower-marine', name: '海洋花', color: 0x00dddd }
        ];
        
        const startX = (this.cameras.main.width - (flowers.length * 120)) / 2;
        
        flowers.forEach((flower, index) => {
            const x = startX + index * 120 + 60;
            
            // 创建花朵图标
            const flowerSprite = this.add.image(x, showcaseY, flower.key)
                .setScale(0.8)
                .setInteractive({ useHandCursor: true })
                .setDepth(100);
            
            // 创建名称标签
            const nameTag = this.add.text(x, showcaseY + 50, flower.name, {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setDepth(100);
            
            // 添加交互效果
            flowerSprite.on('pointerover', () => {
                this.tweens.add({
                    targets: [flowerSprite, nameTag],
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    ease: 'Power2'
                });
                flowerSprite.setTint(0xffdddd);
            });
            
            flowerSprite.on('pointerout', () => {
                this.tweens.add({
                    targets: [flowerSprite, nameTag],
                    scaleX: flowerSprite.scaleX === 1.2 ? 0.8 : flowerSprite.scaleX,
                    scaleY: flowerSprite.scaleY === 1.2 ? 0.8 : flowerSprite.scaleY,
                    duration: 200,
                    ease: 'Power2'
                });
                flowerSprite.clearTint();
            });
            
            flowerSprite.on('pointerdown', () => {
                this.showMessage(`选择了${flower.name}！`);
            });
        });
        
        // 添加展示区域标题
        this.add.text(
            this.cameras.main.width / 2,
            showcaseY - 80,
            '🌸 花朵种类',
            {
                fontSize: '24px',
                color: '#2d5016',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setDepth(100);
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
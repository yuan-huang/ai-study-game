import { Scene } from 'phaser';
import { PhaserFontConfig, createText, TextStyles } from '../config/PhaserFontConfig';

export class BaseScene extends Scene {

    constructor(key: string) {
        super(key);
    }

    init(data?: any): void {
        // 场景初始化逻辑
        console.log(`Initializing scene: ${this.scene.key}`);
        

    }

    preload(): void {
        // 资源预加载
        this.load.on('progress', (value: number) => {
            console.log(`Loading: ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            console.log('Loading complete');
        });
    }

    create(data?: any): void {
        // 场景创建逻辑
        console.log(`Creating scene: ${this.scene.key}`);
        
        // 确保字体已加载
        this.ensureFontsLoaded();
    }

    update(time: number, delta: number): void {
        // 场景更新逻辑
    }

    /**
     * 确保字体已加载，如果没有则使用降级方案
     */
    protected ensureFontsLoaded(): void {
        if (!PhaserFontConfig.isFontLoaded()) {
            console.warn(`⚠️ 场景 ${this.scene.key} 字体未完全加载，使用降级方案`);
            // 可以在这里更新场景中已存在的文本对象
            PhaserFontConfig.updateSceneTextFonts(this);
        }
    }

    /**
     * 创建带有阿里巴巴字体的文本对象
     */
    protected createText(
        x: number, 
        y: number, 
        text: string, 
        stylePreset?: keyof typeof TextStyles,
        customStyle?: Partial<Phaser.Types.GameObjects.Text.TextStyle>
    ): Phaser.GameObjects.Text {
        return createText(this, x, y, text, stylePreset, customStyle);
    }

    /**
     * 创建带有阿里巴巴字体的按钮
     */
    protected addButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Text {
        const button = createText(this, x, y, text, 'BUTTON_TEXT', {
            fontSize: 32,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        button.setInteractive()
            .on('pointerover', () => {
                button.setStyle({ color: '#ffff00' });
            })
            .on('pointerout', () => {
                button.setStyle({ color: '#ffffff' });
            })
            .on('pointerdown', onClick);

        return button;
    }

    protected createBackground(texture: string): void {
        const bg = this.add.image(0, 0, texture);
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }
} 
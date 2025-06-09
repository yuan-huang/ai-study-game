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

        // 监听场景切换事件
        this.events.on('shutdown', this._cleanup, this);
        this.events.on('destroy', this._cleanup, this);
    }

    private _cleanup(): void {
        // 停止所有正在播放的音乐
        this.sound.stopAll();
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
            fontSize: 24,
            backgroundColor: '#4caf50',
            padding: { x: 15, y: 8 }
        });
        
        button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setStyle({ 
                    backgroundColor: '#45a049',
                    color: '#ffffff'
                });
                this.tweens.add({
                    targets: button,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 150,
                    ease: 'Power2'
                });
            })
            .on('pointerout', () => {
                button.setStyle({ 
                    backgroundColor: '#4caf50',
                    color: '#ffffff'
                });
                this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150,
                    ease: 'Power2'
                });
            })
            .on('pointerdown', () => {
                this.tweens.add({
                    targets: button,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    ease: 'Power2',
                    yoyo: true,
                    onComplete: onClick
                });
            });

        return button;
    }

    protected createBackground(texture: string): void {
        const bg = this.add.image(0, 0, texture);
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }



    

    
        /**
         * 使用 rex-ui 创建滚动面板
         */
        protected createRexScrollablePanel(
            x: number,
            y: number,
            width: number,
            height: number
        ): any {
            const scrollablePanel = this.rexUI.add.scrollablePanel({
                x: x,
                y: y,
                width: width,
                height: height,
                
                scrollMode: 'vertical',
                
                background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xffffff, 0.9),
                
                panel: {
                    child: this.rexUI.add.sizer({
                        orientation: 'vertical',
                        space: { item: 5 }
                    }),
                    mask: {
                        padding: 1
                    }
                },
                
                slider: {
                    track: this.rexUI.add.roundRectangle(0, 0, 20, 0, 10, 0xcccccc),
                    thumb: this.rexUI.add.roundRectangle(0, 0, 20, 50, 10, 0x888888),
                },
                
                space: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10,
                    panel: 10,
                }
            });
    
            return scrollablePanel;
        }
    

    
} 
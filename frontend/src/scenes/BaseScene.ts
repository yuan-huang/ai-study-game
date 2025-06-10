import { Scene } from 'phaser';
import { PhaserFontConfig, createText, TextStyles } from '../config/PhaserFontConfig';
import { VolumeSettingsPanel } from '../components/VolumeSettingsPanel';
import { AudioManager } from '../utils/AudioManager';



export class BaseScene extends Scene {
    protected volumeSettingsPanel?: VolumeSettingsPanel;
    protected audioManager: AudioManager;

    constructor(key: string) {
        super(key);
        this.audioManager = AudioManager.getInstance();
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

        // 预加载公共资源（如果还没有加载）
        if (!this.cache.audio.exists('click-sound')) {
            this.load.audio('click-sound', '/audio/ClickSoundEffect.mp3');
        }
    }

    create(data?: any): void {
        // 场景创建逻辑
        console.log(`Creating scene: ${this.scene.key}`);
        
        // 确保字体已加载
        this.ensureFontsLoaded();

        // 监听场景切换事件
        this.events.on('shutdown', this._cleanup, this);
        this.events.on('destroy', this._cleanup, this);

        // 创建音量设置面板
        this.volumeSettingsPanel = new VolumeSettingsPanel(this);

        // 创建右上角设置图标
        this.createVolumeSettingsIcon();
    }

    private _cleanup(): void {
        // 停止所有正在播放的音乐
        this.sound.stopAll();

        // 清理音量设置面板
        if (this.volumeSettingsPanel) {
            this.volumeSettingsPanel.destroy();
        }
    }

    /**
     * 创建右上角的音量设置图标
     */
    protected createVolumeSettingsIcon(): void {
        // 创建设置图标背景
        const iconBg = this.add.graphics();
        iconBg.fillStyle(0x000000, 0.3);
        iconBg.fillCircle(0, 0, 25);
        iconBg.lineStyle(2, 0xffffff, 0.8);
        iconBg.strokeCircle(0, 0, 25);

        // 创建设置图标（使用设置齿轮emoji或图片）
        const settingsIcon = this.add.text(0, 0, '⚙️', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 创建容器
        const iconContainer = this.add.container(
            this.cameras.main.width - 50,
            50,
            [iconBg, settingsIcon]
        );

        iconContainer.setDepth(999);
        iconContainer.setInteractive(this.add.zone(0, 0, 50, 50), Phaser.Geom.Circle.Contains);
        iconContainer.setData('isHovered', false);

        // 添加交互效果
        iconContainer.setData('originalScale', 1);
        iconContainer.on('pointerover', () => {
            if (!iconContainer.getData('isHovered')) {
                iconContainer.setData('isHovered', true);
                this.tweens.add({
                    targets: iconContainer,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });

        iconContainer.on('pointerout', () => {
            if (iconContainer.getData('isHovered')) {
                iconContainer.setData('isHovered', false);
                this.tweens.add({
                    targets: iconContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });

        iconContainer.on('pointerdown', () => {
            // 播放点击音效
            this.audioManager.playSound(this, 'click-sound');
            
            // 点击缩放效果
            this.tweens.add({
                targets: iconContainer,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100,
                ease: 'Power2',
                yoyo: true,
                onComplete: () => {
                    // 显示/隐藏音量设置面板
                    if (this.volumeSettingsPanel) {
                        this.volumeSettingsPanel.toggle();
                    }
                }
            });
        });

        // 设置鼠标悬停样式
        iconContainer.setInteractive({ useHandCursor: true });
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
import { AudioManager } from '../utils/AudioManager';

/**
 * 音量设置面板
 */
export class VolumeSettingsPanel {
    private scene: Phaser.Scene;
    private audioManager: AudioManager;
    private container!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Graphics;
    private isVisible: boolean = false;

    // UI元素
    private masterVolumeSlider!: VolumeSlider;
    private musicVolumeSlider!: VolumeSlider;
    private soundVolumeSlider!: VolumeSlider;
    private muteButton!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.audioManager = AudioManager.getInstance();
        this.create();
    }

    private create(): void {
        // 创建容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // 创建半透明背景
        const panelBg = this.scene.add.graphics();
        panelBg.fillStyle(0x000000, 0.7);
        panelBg.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        panelBg.setInteractive(this.scene.add.zone(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height));
        panelBg.on('pointerdown', () => this.hide());
        this.container.add(panelBg);

        // 创建设置面板背景
        this.background = this.scene.add.graphics();
        this.background.fillStyle(0xffffff, 0.95);
        this.background.lineStyle(3, 0x4a90e2);
        this.background.fillRoundedRect(0, 0, 400, 350, 15);
        this.background.strokeRoundedRect(0, 0, 400, 350, 15);

        // 居中定位
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        this.background.setPosition(centerX - 200, centerY - 175);
        this.container.add(this.background);

        // 创建标题
        const title = this.scene.add.text(centerX, centerY - 130, '🔊 音量设置', {
            fontSize: '28px',
            color: '#333333',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(title);

        // 获取当前音量设置
        const settings = this.audioManager.getVolumeSettings();

        // 创建音量滑动条
        this.masterVolumeSlider = new VolumeSlider(
            this.scene,
            centerX - 150,
            centerY - 80,
            300,
            '主音量',
            settings.masterVolume,
            (value) => {
                this.audioManager.setMasterVolume(value);
                this.audioManager.updateAllAudioVolume(this.scene);
            }
        );
        this.container.add(this.masterVolumeSlider.getContainer());

        this.musicVolumeSlider = new VolumeSlider(
            this.scene,
            centerX - 150,
            centerY - 20,
            300,
            '音乐音量',
            settings.musicVolume,
            (value) => {
                this.audioManager.setMusicVolume(value);
                this.audioManager.updateAllAudioVolume(this.scene);
            }
        );
        this.container.add(this.musicVolumeSlider.getContainer());

        this.soundVolumeSlider = new VolumeSlider(
            this.scene,
            centerX - 150,
            centerY + 40,
            300,
            '音效音量',
            settings.soundVolume,
            (value) => {
                this.audioManager.setSoundVolume(value);
                this.audioManager.updateAllAudioVolume(this.scene);
            }
        );
        this.container.add(this.soundVolumeSlider.getContainer());

        // 创建静音按钮
        this.muteButton = this.scene.add.text(
            centerX,
            centerY + 100,
            settings.isMuted ? '🔇 取消静音' : '🔇 静音',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: settings.isMuted ? '#f44336' : '#4caf50',
                padding: { x: 20, y: 10 },
                fontFamily: 'Arial, sans-serif'
            }
        ).setOrigin(0.5);

        this.muteButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                const isMuted = this.audioManager.toggleMute();
                this.muteButton.setText(isMuted ? '🔇 取消静音' : '🔇 静音');
                this.muteButton.setStyle({
                    backgroundColor: isMuted ? '#f44336' : '#4caf50'
                });
                this.audioManager.updateAllAudioVolume(this.scene);
            });

        this.container.add(this.muteButton);

        // 创建关闭按钮
        const closeButton = this.scene.add.text(
            centerX + 170,
            centerY - 150,
            '✕',
            {
                fontSize: '24px',
                color: '#666666',
                fontFamily: 'Arial, sans-serif'
            }
        ).setOrigin(0.5);

        closeButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.hide());

        this.container.add(closeButton);
    }

    public show(): void {
        this.isVisible = true;
        this.container.setVisible(true);
        
        // 添加淡入动画
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    public hide(): void {
        this.isVisible = false;
        
        // 添加淡出动画
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.container.setVisible(false);
            }
        });
    }

    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public destroy(): void {
        if (this.masterVolumeSlider) this.masterVolumeSlider.destroy();
        if (this.musicVolumeSlider) this.musicVolumeSlider.destroy();
        if (this.soundVolumeSlider) this.soundVolumeSlider.destroy();
        if (this.container) this.container.destroy();
    }
}

/**
 * 音量滑动条组件
 */
class VolumeSlider {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private slider!: Phaser.GameObjects.Graphics;
    private thumb!: Phaser.GameObjects.Graphics;
    private label!: Phaser.GameObjects.Text;
    private valueText!: Phaser.GameObjects.Text;
    
    private isDragging: boolean = false;
    private value: number;
    private width: number;
    private onValueChange: (value: number) => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        labelText: string,
        initialValue: number,
        onValueChange: (value: number) => void
    ) {
        this.scene = scene;
        this.width = width;
        this.value = initialValue;
        this.onValueChange = onValueChange;

        this.container = scene.add.container(x, y);
        this.create(labelText);
        this.setupInteraction();
    }

    private create(labelText: string): void {
        // 创建标签
        this.label = this.scene.add.text(0, -10, labelText, {
            fontSize: '18px',
            color: '#333333',
            fontFamily: 'Arial, sans-serif'
        });
        this.container.add(this.label);

        // 创建滑动条背景
        this.slider = this.scene.add.graphics();
        this.slider.fillStyle(0xcccccc);
        this.slider.fillRoundedRect(0, 20, this.width, 6, 3);
        
        // 创建滑动条填充
        this.slider.fillStyle(0x4a90e2);
        this.slider.fillRoundedRect(0, 20, this.width * this.value, 6, 3);
        
        this.container.add(this.slider);

        // 创建滑块
        this.thumb = this.scene.add.graphics();
        this.thumb.fillStyle(0x4a90e2);
        this.thumb.lineStyle(2, 0xffffff);
        this.thumb.fillCircle(this.width * this.value, 23, 12);
        this.thumb.strokeCircle(this.width * this.value, 23, 12);
        this.container.add(this.thumb);

        // 创建数值显示
        this.valueText = this.scene.add.text(this.width + 20, 15, `${Math.round(this.value * 100)}%`, {
            fontSize: '16px',
            color: '#666666',
            fontFamily: 'Arial, sans-serif'
        });
        this.container.add(this.valueText);
    }

    private setupInteraction(): void {
        // 设置交互区域
        const interactiveZone = this.scene.add.zone(this.width / 2, 23, this.width + 24, 40);
        interactiveZone.setInteractive({ useHandCursor: true });
        this.container.add(interactiveZone);

        interactiveZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;
            this.updateValue(pointer.x - this.container.x - this.container.parentContainer!.x);
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                this.updateValue(pointer.x - this.container.x - this.container.parentContainer!.x);
            }
        });

        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });
    }

    private updateValue(x: number): void {
        // 限制在滑动条范围内
        x = Math.max(0, Math.min(this.width, x));
        this.value = x / this.width;

        // 更新视觉效果
        this.updateVisuals();

        // 触发回调
        this.onValueChange(this.value);
    }

    private updateVisuals(): void {
        // 清除并重绘滑动条
        this.slider.clear();
        this.slider.fillStyle(0xcccccc);
        this.slider.fillRoundedRect(0, 20, this.width, 6, 3);
        this.slider.fillStyle(0x4a90e2);
        this.slider.fillRoundedRect(0, 20, this.width * this.value, 6, 3);

        // 更新滑块位置
        this.thumb.clear();
        this.thumb.fillStyle(0x4a90e2);
        this.thumb.lineStyle(2, 0xffffff);
        this.thumb.fillCircle(this.width * this.value, 23, 12);
        this.thumb.strokeCircle(this.width * this.value, 23, 12);

        // 更新数值显示
        this.valueText.setText(`${Math.round(this.value * 100)}%`);
    }

    public getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }

    public destroy(): void {
        this.container.destroy();
    }
} 
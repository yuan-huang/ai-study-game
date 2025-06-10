import { AudioManager } from '../utils/AudioManager';

/**
 * 音量设置面板 - 简化版，只包含音效音量控制
 */
export class VolumeSettingsPanel {
    private scene: Phaser.Scene;
    private audioManager: AudioManager;
    private container!: Phaser.GameObjects.Container;
    private panelContainer!: Phaser.GameObjects.Container;
    private isVisible: boolean = false;

    // UI元素
    private soundVolumeSlider!: VolumeSlider;
    private muteButton!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.audioManager = AudioManager.getInstance();
        this.create();
    }

    private create(): void {
        // 创建主容器
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(1000);
        this.container.setVisible(false);

        // 创建半透明背景（点击关闭）
        const backgroundOverlay = this.scene.add.graphics();
        backgroundOverlay.fillStyle(0x000000, 0.5);
        backgroundOverlay.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
        
        // 使用zone来处理背景交互
        const backgroundZone = this.scene.add.zone(
            this.scene.cameras.main.width / 2, 
            this.scene.cameras.main.height / 2, 
            this.scene.cameras.main.width, 
            this.scene.cameras.main.height
        );
        backgroundZone.setInteractive();
        backgroundZone.on('pointerdown', () => this.hide());
        
        this.container.add(backgroundOverlay);
        this.container.add(backgroundZone);

        // 创建面板容器（防止事件穿透）
        this.panelContainer = this.scene.add.container(0, 0);
        
        // 计算面板位置
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        const panelWidth = 500; // 调宽20%
        const panelHeight = 250; // 调大高度适应新布局

        // 创建面板背景
        const panelBg = this.scene.add.graphics();
        panelBg.fillStyle(0xffffff, 0.95);
        panelBg.lineStyle(3, 0x4a90e2);
        panelBg.fillRoundedRect(0, 0, panelWidth, panelHeight, 15);
        panelBg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 15);
        
        // 使用zone来处理面板交互，阻止事件穿透
        const panelZone = this.scene.add.zone(panelWidth / 2, panelHeight / 2, panelWidth, panelHeight);
        panelZone.setInteractive();
        panelZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // 阻止事件传播到背景层
            pointer.event.stopPropagation();
        });
        
        this.panelContainer.add(panelBg);
        this.panelContainer.add(panelZone);

        // 创建标题 - 使用阿里巴巴字体
        const title = (this.scene as any).createText(
            panelWidth / 2, 30, 
            '🔊 音效设置', 
            'TITLE_TEXT',
            {
                fontSize: '32px',
                color: '#333333',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        this.panelContainer.add(title);

        // 获取当前音量设置
        const settings = this.audioManager.getVolumeSettings();

        // 创建音效音量滑动条 - 调宽20%
        this.soundVolumeSlider = new VolumeSlider(
            this.scene,
            40,
            90, // 往下调整适应更大的字体
            360, // 从300调宽到360 (20%增长)
            '音效音量',
            settings.soundVolume,
            (value) => {
                this.audioManager.setSoundVolume(value);
                this.audioManager.updateAllAudioVolume(this.scene);
            }
        );
        this.panelContainer.add(this.soundVolumeSlider.getContainer());

        // 创建静音按钮（放在中间，往下调整）
        this.muteButton = (this.scene as any).createText(
            panelWidth / 2,
            180, // 从140再往下调到150
            settings.isMuted ? '🔇 取消静音' : '🔇 静音',
            'BUTTON_TEXT',
            {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: settings.isMuted ? '#f44336' : '#4caf50',
                padding: { x: 25, y: 12 }
            }
        ).setOrigin(0.5);

        this.muteButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                // 鼠标悬停效果
                this.muteButton.setScale(1.05);
            })
            .on('pointerout', () => {
                // 鼠标离开效果
                this.muteButton.setScale(1.0);
            })
            .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                pointer.event.stopPropagation();
                
                // 点击缩放效果
                this.muteButton.setScale(0.95);
                this.scene.time.delayedCall(100, () => {
                    this.muteButton.setScale(1.0);
                });
                
                const isMuted = this.audioManager.toggleMute();
                this.muteButton.setText(isMuted ? '🔇 取消静音' : '🔇 静音');
                this.muteButton.setStyle({
                    backgroundColor: isMuted ? '#f44336' : '#4caf50'
                });
                this.audioManager.updateAllAudioVolume(this.scene);
            });

        this.panelContainer.add(this.muteButton);

        // 创建关闭按钮 - 使用阿里巴巴字体
        const closeButton = (this.scene as any).createText(
            panelWidth - 30,
            30,
            '✕',
            'BUTTON_TEXT',
            {
                fontSize: '32px',
                color: '#666666'
            }
        ).setOrigin(0.5);

        closeButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                // 鼠标悬停效果
                closeButton.setScale(1.2);
                closeButton.setStyle({ color: '#999999' });
            })
            .on('pointerout', () => {
                // 鼠标离开效果
                closeButton.setScale(1.0);
                closeButton.setStyle({ color: '#666666' });
            })
            .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                pointer.event.stopPropagation();
                
                // 点击缩放效果
                closeButton.setScale(0.8);
                this.scene.time.delayedCall(100, () => {
                    this.hide();
                });
            });

        this.panelContainer.add(closeButton);

        // 设置面板容器位置并添加到主容器
        this.panelContainer.setPosition(centerX - panelWidth / 2, centerY - panelHeight / 2);
        this.container.add(this.panelContainer);
    }

    public show(): void {
        console.log('🎛️ 显示音量设置面板');
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
        console.log('🎛️ 隐藏音量设置面板');
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
        console.log('🎛️ 切换音量设置面板状态，当前可见:', this.isVisible);
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    public destroy(): void {
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
    private isHovered: boolean = false;
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
        this.container.add(this.thumb);
        this.updateThumb(false); // 初始化滑块

        // 创建数值显示 - 使用阿里巴巴字体
        this.valueText = (this.scene as any).createText(this.width + 30, 0, `${Math.round(this.value * 100)}%`, 'BODY_TEXT', {
            fontSize: '32px',
            color: '#666666'
        });
        this.container.add(this.valueText);
    }

    private setupInteraction(): void {
        // 设置交互区域
        const interactiveZone = this.scene.add.zone(this.width / 2, 23, this.width + 24, 40);
        interactiveZone.setInteractive({ useHandCursor: true });
        this.container.add(interactiveZone);

        // 获取滑动条在世界坐标中的位置
        const getSliderWorldPosition = () => {
            const containerWorldMatrix = this.container.getWorldTransformMatrix();
            return {
                x: containerWorldMatrix.tx,
                y: containerWorldMatrix.ty
            };
        };

        interactiveZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log('🎚️ 开始拖拽滑动条');
            pointer.event.stopPropagation(); // 阻止事件传播
            this.isDragging = true;
            const worldPos = getSliderWorldPosition();
            this.updateValue(pointer.x - worldPos.x);
        });

        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const worldPos = getSliderWorldPosition();
                this.updateValue(pointer.x - worldPos.x);
            }
        });

        this.scene.input.on('pointerup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                // 检查鼠标是否还在滑块区域内
                const pointer = this.scene.input.activePointer;
                const bounds = interactiveZone.getBounds();
                const isStillOver = bounds.contains(pointer.x, pointer.y);
                this.updateThumb(isStillOver);
            }
        });

        // 添加悬停效果
        interactiveZone.on('pointerover', () => {
            this.updateThumb(true);
        });

        interactiveZone.on('pointerout', () => {
            if (!this.isDragging) {
                this.updateThumb(false);
            }
        });
    }

    private updateValue(x: number): void {
        // 限制在滑动条范围内
        x = Math.max(0, Math.min(this.width, x));
        this.value = x / this.width;

        console.log(`🎚️ 音量值更新: ${Math.round(this.value * 100)}%`);

        // 更新视觉效果
        this.updateVisuals();

        // 触发回调
        this.onValueChange(this.value);
        
        // 输出当前活跃音频数量
        console.log(`🎚️ 当前跟踪音频数量: ${AudioManager.getInstance().getActiveSoundsCount()}`);
    }

    private updateVisuals(): void {
        // 清除并重绘滑动条
        this.slider.clear();
        this.slider.fillStyle(0xcccccc);
        this.slider.fillRoundedRect(0, 20, this.width, 6, 3);
        this.slider.fillStyle(0x4a90e2);
        this.slider.fillRoundedRect(0, 20, this.width * this.value, 6, 3);

        // 更新滑块
        this.updateThumb(this.isHovered);

        // 更新数值显示
        this.valueText.setText(`${Math.round(this.value * 100)}%`);
    }

    private updateThumb(hovered: boolean): void {
        this.isHovered = hovered;
        
        // 清除并重绘滑块
        this.thumb.clear();
        this.thumb.fillStyle(hovered ? 0x357abd : 0x4a90e2);
        this.thumb.lineStyle(2, 0xffffff);
        
        const thumbRadius = hovered ? 14 : 12;
        this.thumb.fillCircle(this.width * this.value, 23, thumbRadius);
        this.thumb.strokeCircle(this.width * this.value, 23, thumbRadius);
    }

    public getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }

    public destroy(): void {
        this.container.destroy();
    }
} 
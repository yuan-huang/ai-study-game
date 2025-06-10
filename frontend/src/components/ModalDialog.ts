import { Scene } from 'phaser';

export interface ModalDialogConfig {
    scene: Scene;
    width?: number;
    height?: number;
    backgroundColor?: number;
    borderColor?: number;
    borderWidth?: number;
    title?: string;
    titleStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    onClose?: () => void;
}

export class ModalDialog {
    private scene: Scene;
    private container!: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Rectangle;
    private contentContainer!: Phaser.GameObjects.Container;
    private titleContainer?: Phaser.GameObjects.Container;
    private titleText?: Phaser.GameObjects.Text;
    private closeButton!: Phaser.GameObjects.Rectangle;
    private closeButtonText!: Phaser.GameObjects.Text;
    private overlay!: Phaser.GameObjects.Rectangle;

    private width: number;
    private height: number;
    private backgroundColor: number;
    private borderColor: number;
    private borderWidth: number;
    private title?: string;
    private titleStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    private onCloseCallback?: () => void;
    private isVisible: boolean = false;

    constructor(config: ModalDialogConfig) {
        this.scene = config.scene;
        this.width = config.width || 600;
        this.height = config.height || 400;
        this.backgroundColor = config.backgroundColor || 0xffffff;
        this.borderColor = config.borderColor || 0xcccccc;
        this.borderWidth = config.borderWidth || 2;
        this.title = config.title;
        this.titleStyle = config.titleStyle || {
            fontSize: '20px',
            color: '#333333',
            fontStyle: 'bold',
            fontFamily: 'Arial, sans-serif'
        };
        this.onCloseCallback = config.onClose;

        // 始终在屏幕中央显示
        const x = this.scene.cameras.main.centerX;
        const y = this.scene.cameras.main.centerY;

        this.createModal(x, y);
        this.setupEvents();
        this.hide(); // 默认隐藏
    }

    private createModal(x: number, y: number): void {
        // 创建遮罩层
        this.overlay = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000,
            0.5
        );
        this.overlay.setDepth(999);
        this.overlay.setInteractive();

        // 创建主容器
        this.container = this.scene.add.container(x, y);
        this.container.setDepth(1000);

        // 主背景 - 圆角矩形效果
        this.background = this.scene.add.rectangle(0, 0, this.width, this.height, this.backgroundColor, 0.98);
        this.background.setStrokeStyle(this.borderWidth, this.borderColor);

        // 创建标题（如果提供了标题）
        this.createTitle();

        // 内容容器
        const contentOffsetY = this.title ? 30 : 0; // 如果有标题，内容向下偏移
        this.contentContainer = this.scene.add.container(0, contentOffsetY);

        // 创建关闭按钮
        this.createCloseButton();

        // 添加到主容器
        const elements = [this.background, this.contentContainer, this.closeButton, this.closeButtonText];
        if (this.titleContainer) {
            elements.splice(1, 0, this.titleContainer); // 在背景后、内容前插入标题
        }
        this.container.add(elements);
    }

    private createTitle(): void {
        if (!this.title) return;

        this.titleContainer = this.scene.add.container(0, -this.height / 2 + 50);

        // 标题背景
        const titleBg = this.scene.add.rectangle(0, 0, this.width - 40, 60, this.backgroundColor);
        titleBg.setStrokeStyle(2, this.borderColor);

        // 标题文字
        this.titleText = this.scene.add.text(0, 0, this.title, this.titleStyle).setOrigin(0.5);

        this.titleContainer.add([titleBg, this.titleText]);
    }

    private createCloseButton(): void {
        const buttonSize = 40;
        const margin = 15;

        this.closeButton = this.scene.add.rectangle(
            this.width / 2 - margin - buttonSize / 2,
            -this.height / 2 + margin + buttonSize / 2,
            buttonSize,
            buttonSize,
            0xff5722,
            0.9
        );
        this.closeButton.setStrokeStyle(2, 0xd32f2f);
        this.closeButton.setInteractive({ useHandCursor: true });

        this.closeButtonText = this.scene.add.text(
            this.width / 2 - margin - buttonSize / 2,
            -this.height / 2 + margin + buttonSize / 2,
            '✕',
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
    }

    private setupEvents(): void {
        // 关闭按钮事件
        this.closeButton.on('pointerdown', () => {
            this.close();
        });

        // 添加按钮悬停效果
        this.addButtonHoverEffect(this.closeButton, this.closeButtonText, 1.1);

        // 点击遮罩层关闭弹窗
        this.overlay.on('pointerdown', () => {
            this.close();
        });

        // ESC键关闭弹窗
        this.scene.input.keyboard?.on('keydown-ESC', () => {
            if (this.isVisible) {
                this.close();
            }
        });
    }

    private addButtonHoverEffect(
        button: Phaser.GameObjects.Rectangle,
        text: Phaser.GameObjects.Text | null,
        scale: number = 1.1
    ): void {
        button.on('pointerover', () => {
            button.setScale(scale);
            if (text) text.setScale(scale);
        });

        button.on('pointerout', () => {
            button.setScale(1);
            if (text) text.setScale(1);
        });
    }

    /**
     * 显示弹窗
     */
    public show(): void {
        if (this.isVisible) return;

        this.overlay.setVisible(true);
        this.container.setVisible(true);
        this.isVisible = true;

        // 显示动画
        this.container.setScale(0.8);
        this.container.setAlpha(0);

        this.scene.tweens.add({
            targets: this.container,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 0.5,
            duration: 300,
            ease: 'Power2'
        });
    }

    /**
     * 隐藏弹窗（不销毁）
     */
    public hide(): void {
        if (!this.isVisible) return;

        this.scene.tweens.add({
            targets: this.container,
            scaleX: 0.8,
            scaleY: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.container.setVisible(false);
                this.isVisible = false;
            }
        });

        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.overlay.setVisible(false);
            }
        });
    }

    /**
     * 关闭弹窗
     */
    public close(): void {
        this.hide();
        
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    /**
     * 销毁弹窗
     */
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
        }
        if (this.overlay) {
            this.overlay.destroy();
        }
    }

    /**
     * 添加内容到弹窗
     */
    public addContent(content: Phaser.GameObjects.GameObject): void {
        this.contentContainer.add(content);
    }

    /**
     * 添加内容到弹窗（简化版本）
     * 支持单个对象或对象数组
     */
    public add(content: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]): void {
        if (Array.isArray(content)) {
            this.contentContainer.add(content);
        } else {
            this.contentContainer.add(content);
        }
    }

    /**
     * 清空内容
     */
    public clearContent(): void {
        this.contentContainer.removeAll(true);
    }

    /**
     * 设置弹窗大小
     */
    public setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.background.setSize(width, height);
        
        // 更新关闭按钮位置
        const buttonSize = 40;
        const margin = 15;
        this.closeButton.setPosition(
            width / 2 - margin - buttonSize / 2,
            -height / 2 + margin + buttonSize / 2
        );
        this.closeButtonText.setPosition(
            width / 2 - margin - buttonSize / 2,
            -height / 2 + margin + buttonSize / 2
        );
    }



    /**
     * 获取内容容器，用于添加自定义内容
     */
    public getContentContainer(): Phaser.GameObjects.Container {
        return this.contentContainer;
    }

    /**
     * 获取弹窗尺寸
     */
    public getSize(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    /**
     * 检查弹窗是否可见
     */
    public isShown(): boolean {
        return this.isVisible;
    }

    /**
     * 设置背景颜色
     */
    public setBackgroundColor(color: number): void {
        this.backgroundColor = color;
        this.background.setFillStyle(color);
    }

    /**
     * 设置边框样式
     */
    public setBorderStyle(width: number, color: number): void {
        this.borderWidth = width;
        this.borderColor = color;
        this.background.setStrokeStyle(width, color);
    }

    /**
     * 设置标题文本
     */
    public setTitle(title: string): void {
        this.title = title;
        if (this.titleText) {
            this.titleText.setText(title);
        }
    }

    /**
     * 获取标题文本
     */
    public getTitle(): string | undefined {
        return this.title;
    }
} 
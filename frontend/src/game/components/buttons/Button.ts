import { Scene } from 'phaser';

interface GameButtonConfig {
    x: number;
    y: number;
    width?: number;
    height?: number;
    text: string;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    backgroundColor?: number;
    backgroundAlpha?: number;
    hoverColor?: number;
    activeColor?: number;
    borderColor?: number;
    borderWidth?: number;
    borderRadius?: number;
    padding?: { x: number; y: number };
    onClick?: () => void;
    onHover?: () => void;
    onOut?: () => void;
}

const DEFAULT_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: '18px',
    fontFamily: 'Microsoft YaHei',
    color: '#ffffff',
    fontStyle: 'bold'
};

export class GameButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private text: Phaser.GameObjects.Text;
    private config: Required<GameButtonConfig>;
    private isHovered: boolean = false;
    private isPressed: boolean = false;

    constructor(scene: Scene, config: GameButtonConfig) {
        super(scene, config.x, config.y);

        // 设置默认配置
        this.config = {
            width: 200,
            height: 50,
            text: config.text,
            backgroundColor: 0x4CAF50,
            backgroundAlpha: 1,
            hoverColor: 0x45a049,
            activeColor: 0x3d8b40,
            borderColor: 0x45a049,
            borderWidth: 2,
            borderRadius: 25,
            padding: { x: 20, y: 10 },
            textStyle: { ...DEFAULT_TEXT_STYLE, ...config.textStyle },
            onClick: config.onClick || (() => {}),
            onHover: config.onHover || (() => {}),
            onOut: config.onOut || (() => {}),
            x: config.x,
            y: config.y
        };

        // 创建背景
        this.background = new Phaser.GameObjects.Graphics(scene);
        this.add(this.background);

        // 创建文本
        this.text = new Phaser.GameObjects.Text(
            scene,
            0,
            0,
            this.config.text,
            this.config.textStyle
        );
        this.text.setOrigin(0.5);
        this.add(this.text);

        // 设置交互
        this.setSize(this.config.width, this.config.height);
        this.setInteractive({ useHandCursor: true });

        // 绑定事件
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);

        // 初始渲染
        this.drawButton();

        // 添加到场景
        scene.add.existing(this);
    }

    private drawButton(): void {
        this.background.clear();

        // 设置颜色
        let color = this.config.backgroundColor;
        if (this.isPressed) {
            color = this.config.activeColor;
        } else if (this.isHovered) {
            color = this.config.hoverColor;
        }

        // 绘制背景
        this.background.fillStyle(color, this.config.backgroundAlpha);
        if (this.config.borderWidth > 0) {
            this.background.lineStyle(this.config.borderWidth, this.config.borderColor);
        }

        // 绘制圆角矩形
        const width = this.config.width;
        const height = this.config.height;
        const radius = this.config.borderRadius;

        this.background.beginPath();
        this.background.moveTo(-width / 2 + radius, -height / 2);
        this.background.lineTo(width / 2 - radius, -height / 2);
        this.background.arc(width / 2 - radius, -height / 2 + radius, radius, -Math.PI / 2, 0);
        this.background.lineTo(width / 2, height / 2 - radius);
        this.background.arc(width / 2 - radius, height / 2 - radius, radius, 0, Math.PI / 2);
        this.background.lineTo(-width / 2 + radius, height / 2);
        this.background.arc(-width / 2 + radius, height / 2 - radius, radius, Math.PI / 2, Math.PI);
        this.background.lineTo(-width / 2, -height / 2 + radius);
        this.background.arc(-width / 2 + radius, -height / 2 + radius, radius, Math.PI, -Math.PI / 2);
        this.background.closePath();
        this.background.fillPath();
        if (this.config.borderWidth > 0) {
            this.background.strokePath();
        }

        // 添加简单的阴影效果
        if (!this.isPressed) {
            this.background.lineStyle(1, 0x000000, 0.1);
            this.background.lineTo(-width / 2, height / 2);
            this.background.lineTo(width / 2, height / 2);
            this.background.strokePath();
        }
    }

    private onPointerOver(): void {
        this.isHovered = true;
        this.drawButton();
        this.config.onHover();
        // 添加悬停动画
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 100,
            ease: 'Power1'
        });
    }

    private onPointerOut(): void {
        this.isHovered = false;
        this.isPressed = false;
        this.drawButton();
        this.config.onOut();
        // 恢复原始大小
        this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power1'
        });
    }

    private onPointerDown(): void {
        this.isPressed = true;
        this.drawButton();
        // 添加按下动画
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            ease: 'Power1'
        });
    }

    private onPointerUp(): void {
        this.isPressed = false;
        this.drawButton();
        this.config.onClick();
        // 恢复悬停大小
        this.scene.tweens.add({
            targets: this,
            scaleX: this.isHovered ? 1.05 : 1,
            scaleY: this.isHovered ? 1.05 : 1,
            duration: 50,
            ease: 'Power1'
        });
    }

    public setText(text: string): void {
        this.config.text = text;
        this.text.setText(text);
    }

    public setTextStyle(style: Partial<Phaser.Types.GameObjects.Text.TextStyle>): void {
        this.config.textStyle = { ...this.config.textStyle, ...style };
        this.text.setStyle(this.config.textStyle);
    }

    public setBackgroundColor(color: number): void {
        this.config.backgroundColor = color;
        this.drawButton();
    }
} 
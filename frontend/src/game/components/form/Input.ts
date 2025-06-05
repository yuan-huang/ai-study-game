import { Scene } from 'phaser';
import { BaseStyle, BaseComponentConfig } from '../utils/types';

interface InputStyle extends BaseStyle {
    focusBorderColor?: number;
    focusShadowAlpha?: number;
}

interface InputConfig extends BaseComponentConfig {
    placeholder?: string;
    defaultValue?: string;
    maxLength?: number;
    style?: Partial<InputStyle>;
    onFocus?: () => void;
    onBlur?: () => void;
    onChange?: (value: string) => void;
    onEnter?: () => void;
}

const DEFAULT_STYLE: InputStyle = {
    backgroundColor: 0xFFFFFF,
    backgroundAlpha: 0.9,
    borderColor: 0xE0E0E0,
    borderWidth: 2,
    borderRadius: 25,
    textColor: '#333333',
    fontSize: '16px',
    fontFamily: 'Microsoft YaHei',
    padding: { x: 20, y: 10 },
    focusBorderColor: 0x4CAF50,
    focusShadowAlpha: 0.2
};

interface RequiredInputConfig extends Required<Omit<InputConfig, 'style'>> {
    style: InputStyle;
}

export class Input extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private inputElement!: HTMLInputElement;
    private config: RequiredInputConfig;
    private isFocused: boolean = false;

    constructor(scene: Scene, config: InputConfig) {
        super(scene, config.x, config.y);

        // 设置默认配置
        this.config = {
            width: 200,
            height: 40,
            placeholder: '',
            defaultValue: '',
            maxLength: 50,
            style: { ...DEFAULT_STYLE, ...(config.style || {}) },
            onFocus: config.onFocus || (() => {}),
            onBlur: config.onBlur || (() => {}),
            onChange: config.onChange || (() => {}),
            onEnter: config.onEnter || (() => {}),
            x: config.x,
            y: config.y
        };

        // 创建背景
        this.background = new Phaser.GameObjects.Graphics(scene);
        this.add(this.background);

        // 创建输入框
        this.createInput();

        // 初始渲染
        this.drawBackground();

        // 添加到场景
        scene.add.existing(this);
    }

    private createInput(): void {
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.placeholder = this.config.placeholder;
        this.inputElement.value = this.config.defaultValue;
        this.inputElement.maxLength = this.config.maxLength;

        // 设置样式
        const style = {
            position: 'absolute',
            left: `${this.x - this.config.width / 2}px`,
            top: `${this.y - this.config.height / 2}px`,
            width: `${this.config.width}px`,
            height: `${this.config.height}px`,
            padding: `${this.config.style.padding.y}px ${this.config.style.padding.x}px`,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: this.config.style.textColor,
            fontSize: this.config.style.fontSize,
            fontFamily: this.config.style.fontFamily,
            textAlign: 'center',
            zIndex: '1000'
        } as const;

        Object.assign(this.inputElement.style, style);

        // 添加事件监听
        this.inputElement.addEventListener('focus', () => {
            this.isFocused = true;
            this.drawBackground();
            this.config.onFocus();
        });

        this.inputElement.addEventListener('blur', () => {
            this.isFocused = false;
            this.drawBackground();
            this.config.onBlur();
        });

        this.inputElement.addEventListener('input', () => {
            this.config.onChange(this.inputElement.value);
        });

        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.config.onEnter();
            }
        });

        // 将输入框添加到DOM
        const gameContainer = document.getElementById(this.scene.game.config.parent as string);
        if (gameContainer) {
            gameContainer.appendChild(this.inputElement);
        }
    }

    private drawBackground(): void {
        this.background.clear();

        // 设置样式
        const style = this.config.style;
        const borderColor = this.isFocused ? (style.focusBorderColor || style.borderColor) : style.borderColor;
        const shadowAlpha = this.isFocused ? (style.focusShadowAlpha || 0.2) : 0.1;

        // 绘制背景
        this.background.fillStyle(style.backgroundColor, style.backgroundAlpha);
        this.background.lineStyle(style.borderWidth, borderColor);

        // 绘制圆角矩形
        const width = this.config.width;
        const height = this.config.height;
        const radius = style.borderRadius;

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
        this.background.strokePath();

        // 添加焦点状态的发光效果
        if (this.isFocused) {
            this.background.lineStyle(6, borderColor, shadowAlpha);
            this.background.strokePath();
        }
    }

    public getValue(): string {
        return this.inputElement.value;
    }

    public setValue(value: string): void {
        this.inputElement.value = value;
        this.config.onChange(value);
    }

    public setPlaceholder(text: string): void {
        this.config.placeholder = text;
        this.inputElement.placeholder = text;
    }

    public focus(): void {
        this.inputElement.focus();
    }

    public blur(): void {
        this.inputElement.blur();
    }

    public destroy(): void {
        this.inputElement.remove();
        super.destroy();
    }
} 
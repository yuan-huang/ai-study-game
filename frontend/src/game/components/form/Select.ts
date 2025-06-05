import { Scene } from 'phaser';
import { BaseStyle, BaseComponentConfig } from '../utils/types';

interface SelectStyle extends BaseStyle {
    optionBackgroundColor: number;
    optionHoverColor: number;
    optionTextColor: string;
}

interface SelectOption {
    value: string;
    text: string;
}

interface SelectConfig extends BaseComponentConfig {
    options: SelectOption[];
    defaultValue?: string;
    style?: Partial<SelectStyle>;
    onChange?: (value: string) => void;
}

const DEFAULT_STYLE: SelectStyle = {
    backgroundColor: 0xFFFFFF,
    backgroundAlpha: 0.9,
    borderColor: 0xE0E0E0,
    borderWidth: 2,
    borderRadius: 25,
    textColor: '#333333',
    fontSize: '16px',
    fontFamily: 'Microsoft YaHei',
    padding: { x: 20, y: 10 },
    optionBackgroundColor: 0xFFFFFF,
    optionHoverColor: 0xF5F5F5,
    optionTextColor: '#333333'
};

interface RequiredSelectConfig extends Required<Omit<SelectConfig, 'style'>> {
    style: SelectStyle;
}

export class Select extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private selectElement!: HTMLSelectElement;
    private config: RequiredSelectConfig;

    constructor(scene: Scene, config: SelectConfig) {
        super(scene, config.x, config.y);

        // 设置默认配置
        this.config = {
            width: 200,
            height: 40,
            options: config.options,
            defaultValue: config.defaultValue || config.options[0]?.value || '',
            style: { ...DEFAULT_STYLE, ...(config.style || {}) },
            onChange: config.onChange || (() => {}),
            x: config.x,
            y: config.y
        };

        // 创建背景
        this.background = new Phaser.GameObjects.Graphics(scene);
        this.add(this.background);

        // 创建选择框
        this.createSelect();

        // 初始渲染
        this.drawBackground();

        // 添加到场景
        scene.add.existing(this);
    }

    private createSelect(): void {
        this.selectElement = document.createElement('select');
        
        // 添加选项
        this.config.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            this.selectElement.appendChild(optionElement);
        });

        // 设置默认值
        this.selectElement.value = this.config.defaultValue;

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
            cursor: 'pointer',
            textAlign: 'center',
            zIndex: '1000',
            appearance: 'none',
            WebkitAppearance: 'none'
        } as const;

        Object.assign(this.selectElement.style, style);

        // 添加自定义样式
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            select::-ms-expand {
                display: none;
            }
            select option {
                background-color: ${this.rgbToHex(this.config.style.optionBackgroundColor)};
                color: ${this.config.style.optionTextColor};
                padding: 8px;
            }
            select option:hover {
                background-color: ${this.rgbToHex(this.config.style.optionHoverColor)};
            }
        `;
        document.head.appendChild(styleSheet);

        // 添加事件监听
        this.selectElement.addEventListener('change', () => {
            this.config.onChange(this.selectElement.value);
        });

        // 将选择框添加到DOM
        const gameContainer = document.getElementById(this.scene.game.config.parent as string);
        if (gameContainer) {
            gameContainer.appendChild(this.selectElement);
        }
    }

    private drawBackground(): void {
        this.background.clear();

        // 设置样式
        const style = this.config.style;

        // 绘制背景
        this.background.fillStyle(style.backgroundColor, style.backgroundAlpha);
        this.background.lineStyle(style.borderWidth, style.borderColor);

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

        // 绘制下拉箭头
        const arrowSize = 8;
        const arrowX = width / 2 - 20;
        const arrowY = 0;

        this.background.lineStyle(2, parseInt(this.config.style.textColor.replace('#', ''), 16));
        this.background.beginPath();
        this.background.moveTo(arrowX - arrowSize, arrowY - arrowSize / 2);
        this.background.lineTo(arrowX, arrowY + arrowSize / 2);
        this.background.lineTo(arrowX + arrowSize, arrowY - arrowSize / 2);
        this.background.strokePath();
    }

    private rgbToHex(color: number): string {
        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    public getValue(): string {
        return this.selectElement.value;
    }

    public setValue(value: string): void {
        this.selectElement.value = value;
        this.config.onChange(value);
    }

    public setOptions(options: SelectOption[]): void {
        this.config.options = options;
        
        // 清除现有选项
        while (this.selectElement.firstChild) {
            this.selectElement.removeChild(this.selectElement.firstChild);
        }

        // 添加新选项
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            this.selectElement.appendChild(optionElement);
        });
    }

    public destroy(): void {
        this.selectElement.remove();
        super.destroy();
    }
} 
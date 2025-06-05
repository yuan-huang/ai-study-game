// 基础样式接口
export interface BaseStyle {
    backgroundColor: number;
    backgroundAlpha: number;
    borderColor: number;
    borderWidth: number;
    borderRadius: number;
    textColor: string;
    fontSize: string;
    fontFamily: string;
    padding: { x: number; y: number };
}

// 基础组件配置接口
export interface BaseComponentConfig {
    x: number;
    y: number;
    width?: number;
    height?: number;
}

// 文本样式配置
export interface TextStyle extends Partial<Phaser.Types.GameObjects.Text.TextStyle> {
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    fontStyle?: string;
}

// 动画配置
export interface AnimationConfig {
    duration?: number;
    ease?: string;
    delay?: number;
    repeat?: number;
    yoyo?: boolean;
}

// 交互事件配置
export interface InteractiveConfig {
    useHandCursor?: boolean;
    draggable?: boolean;
    dropZone?: boolean;
    pixelPerfect?: boolean;
    alphaTolerance?: number;
} 
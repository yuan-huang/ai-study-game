import { BaseScene } from '../scenes/BaseScene';
import { 
    PhaserFontConfig, 
    createText, 
    createAnimatedText,
    TextStyles, 
    FontStacks 
} from '../config/PhaserFontConfig';

/**
 * Phaser游戏中阿里巴巴字体使用示例
 */
export class PhaserFontUsageExampleScene extends BaseScene {
    
    constructor() {
        super('PhaserFontUsageExample');
    }

    create(): void {
        super.create();
        
        // 创建背景
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x2d3748
        );

        this.createTitleSection();
        this.createContentSection();
    }

    /**
     * 创建标题区域
     */
    private createTitleSection(): void {
        const centerX = this.cameras.main.centerX;
        
        // 主标题 - 使用阿里巴巴数黑体
        createText(
            this, 
            centerX, 
            100, 
            '阿里巴巴字体示例', 
            'TITLE_LARGE'
        ).setOrigin(0.5);

        // 副标题 - 使用数黑体
        createText(
            this, 
            centerX, 
            160, 
            'Phaser游戏字体配置演示', 
            'TITLE_MEDIUM'
        ).setOrigin(0.5);
    }

    /**
     * 创建内容区域
     */
    private createContentSection(): void {
        const leftCol = 200;
        const startY = 280;

        // 普惠体正文
        createText(
            this, 
            leftCol, 
            startY, 
            '阿里巴巴普惠体特点：\n\n' +
            '• 现代简洁的设计风格\n' +
            '• 优秀的中英文混排效果\n' +
            '• 适合长文本阅读\n' +
            '• 支持多种字重变化', 
            'BODY_TEXT',
            {
                wordWrap: { width: 400, useAdvancedWrap: true }
            }
        ).setOrigin(0, 0);
    }
}

// 使用示例说明
export const USAGE_EXAMPLES = {
    basic: `
// 基本文本创建
const title = createText(this, 400, 100, '游戏标题', 'TITLE_LARGE');
    `,
    
    animated: `
// 动画文本
const fadeInText = createAnimatedText(this, 400, 300, '淡入文本', 'UI_TEXT', 'fadeIn');
    `
}; 

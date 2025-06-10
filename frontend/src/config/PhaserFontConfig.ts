// 移除错误的导入，所有配置都在本文件中定义

/**
 * Phaser游戏全局字体配置
 * 提供统一的阿里巴巴字体管理和应用方案
 */
export class PhaserFontConfig {
    private static instance: PhaserFontConfig;
    private fontsLoaded: boolean = false;
    private defaultFontFamily: string = 'Alibaba-PuHuiTi';
    private fallbackFontFamily: string = 'Microsoft YaHei, Arial, sans-serif';

    // 字体文件路径配置
    private static readonly FONT_PATHS = {
        REGULAR: '/font/AlibabaSans-Regular.woff2',
        BOLD: '/font/AlibabaSans-Bold.woff2'
    };

    // 字体文件备用路径配置（用于不支持 WOFF2 的浏览器）
    private static readonly FONT_FALLBACK_PATHS = {
        REGULAR: '/font/AlibabaSans-Regular.woff',
        BOLD: '/font/AlibabaSans-Bold.woff'
    };

    // 阿里巴巴字体名称映射
    public static readonly FONT_FAMILIES = {
        SANS: 'Alibaba-Sans'
    } as const;

    // 完整的字体栈（包含fallback）
    public static readonly FONT_STACKS = {
        SANS: 'Alibaba-Sans, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
        SYSTEM: 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif'
    } as const;

    // 全局默认文本样式
    public static readonly DEFAULT_TEXT_STYLES: Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
        fontSize: 24,
        color: '#333333',
        align: 'left',
        wordWrap: { width: 0, useAdvancedWrap: true }
    };

    // 游戏中常用的预设样式
    public static readonly PRESET_STYLES = {
        // 主标题样式
        TITLE_LARGE: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 48,
            color: '#1a1a1a',
            fontStyle: 'bold',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 2,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#00000040',
                blur: 6,
                stroke: false,
                fill: true
            }
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 副标题样式
        TITLE_MEDIUM: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 32,
            color: '#2d3748',
            fontStyle: 'bold',
            align: 'center',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#00000030',
                blur: 4
            }
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 小标题样式
        TITLE_SMALL: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 24,
            color: '#4a5568',
            fontStyle: '600',
            align: 'left'
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 正文样式
        BODY_TEXT: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 20,
            color: '#4a5568',
            align: 'left',
            lineSpacing: 6,
            wordWrap: { width: 600, useAdvancedWrap: true }
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 按钮文字样式
        BUTTON_TEXT: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 18,
            color: '#ffffff',
            fontStyle: '500',
            align: 'center'
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 数字显示样式
        NUMBER_TEXT: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 28,
            color: '#e53e3e',
            fontStyle: 'bold',
            align: 'center'
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 标签文字样式
        LABEL_TEXT: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 16,
            color: '#718096',
            align: 'left'
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 游戏UI文字样式
        UI_TEXT: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 16,
            color: '#ffffff',
            fontStyle: '400',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 错误/警告文字样式
        ERROR_TEXT: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 18,
            color: '#e53e3e',
            fontStyle: '500',
            align: 'center'
        } as Phaser.Types.GameObjects.Text.TextStyle,

        // 成功/提示文字样式
        SUCCESS_TEXT: {
            fontFamily: PhaserFontConfig.FONT_STACKS.SANS,
            fontSize: 18,
            color: '#38a169',
            fontStyle: '500',
            align: 'center'
        } as Phaser.Types.GameObjects.Text.TextStyle
    };

    // 响应式字体大小配置
    public static readonly RESPONSIVE_SCALES = {
        MOBILE: 0.8,    // 移动端缩放
        TABLET: 0.9,    // 平板端缩放
        DESKTOP: 1.0    // 桌面端缩放
    };

    static getInstance(): PhaserFontConfig {
        if (!PhaserFontConfig.instance) {
            PhaserFontConfig.instance = new PhaserFontConfig();
        }
        return PhaserFontConfig.instance;
    }

    /**
     * 初始化Phaser游戏的全局字体配置
     * 在游戏启动时调用
     */
    public static async initializeGameFonts(): Promise<void> {
        const instance = PhaserFontConfig.getInstance();
        
        try {
            console.log('🔤 开始初始化Phaser游戏字体...');
            
            // 加载字体文件
            await instance.loadFontFiles();
            
            // 等待字体加载完成
            await instance.waitForFontsLoad();
            
            // 应用全局字体设置
            instance.applyGlobalFontSettings();
            
            console.log('✅ Phaser游戏字体初始化完成');
            instance.fontsLoaded = true;
            
        } catch (error) {
            console.warn('⚠️ Phaser字体初始化失败，使用降级方案:', error);
            instance.applyFallbackFontSettings();
        }
    }

    /**
     * 加载字体文件
     */
    private async loadFontFiles(): Promise<void> {
        const fontFacePromises = [
            new FontFace('Alibaba-Sans', `url(${PhaserFontConfig.FONT_PATHS.REGULAR}) format('woff2'), url(${PhaserFontConfig.FONT_FALLBACK_PATHS.REGULAR}) format('woff')`, { weight: '400' }),
            new FontFace('Alibaba-Sans', `url(${PhaserFontConfig.FONT_PATHS.BOLD}) format('woff2'), url(${PhaserFontConfig.FONT_FALLBACK_PATHS.BOLD}) format('woff')`, { weight: '700' })
        ];

        const loadedFonts = await Promise.all(fontFacePromises.map(font => font.load()));
        loadedFonts.forEach(font => document.fonts.add(font));
    }

    /**
     * 等待字体加载完成
     */
    private async waitForFontsLoad(): Promise<void> {
        const fontPromises = [
            document.fonts.load('400 16px Alibaba-Sans'),
            document.fonts.load('700 16px Alibaba-Sans')
        ];

        await Promise.allSettled(fontPromises);
        
        // 验证字体是否成功加载
        const testElement = document.createElement('span');
        testElement.style.fontFamily = PhaserFontConfig.FONT_FAMILIES.SANS;
        testElement.style.fontSize = '16px';
        testElement.textContent = '测试';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        document.body.appendChild(testElement);
        
        // 延迟一下确保字体渲染完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        document.body.removeChild(testElement);
    }

    /**
     * 应用全局字体设置
     */
    private applyGlobalFontSettings(): void {
        // 为Phaser设置CSS字体变量
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --phaser-font-primary: ${PhaserFontConfig.FONT_STACKS.SANS};
            }
            
            /* Phaser Canvas字体预加载 */
            .phaser-font-preload {
                font-family: ${PhaserFontConfig.FONT_STACKS.SANS};
                position: absolute;
                left: -9999px;
                visibility: hidden;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 应用降级字体设置
     */
    private applyFallbackFontSettings(): void {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --phaser-font-primary: ${PhaserFontConfig.FONT_STACKS.SYSTEM};
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 创建带有预设样式的文本对象
     */
    public static createText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        stylePreset?: keyof typeof PhaserFontConfig.PRESET_STYLES,
        customStyle?: Partial<Phaser.Types.GameObjects.Text.TextStyle>
    ): Phaser.GameObjects.Text {
        let style: Phaser.Types.GameObjects.Text.TextStyle;
        
        if (stylePreset) {
            style = { ...PhaserFontConfig.PRESET_STYLES[stylePreset] };
        } else {
            style = { ...PhaserFontConfig.DEFAULT_TEXT_STYLES };
        }
        
        // 应用自定义样式覆盖
        if (customStyle) {
            style = { ...style, ...customStyle };
        }
        
        return scene.add.text(x, y, text, style);
    }

    /**
     * 更新现有文本对象的样式
     */
    public static updateTextStyle(
        textObject: Phaser.GameObjects.Text,
        stylePreset: keyof typeof PhaserFontConfig.PRESET_STYLES,
        customStyle?: Partial<Phaser.Types.GameObjects.Text.TextStyle>
    ): void {
        let style = { ...PhaserFontConfig.PRESET_STYLES[stylePreset] };
        
        if (customStyle) {
            style = { ...style, ...customStyle };
        }
        
        textObject.setStyle(style);
    }

    /**
     * 获取响应式字体大小
     */
    public static getResponsiveFontSize(
        baseSize: number,
        screenWidth: number
    ): number {
        let scale = PhaserFontConfig.RESPONSIVE_SCALES.DESKTOP;
        
        if (screenWidth < 768) {
            scale = PhaserFontConfig.RESPONSIVE_SCALES.MOBILE;
        } else if (screenWidth < 1024) {
            scale = PhaserFontConfig.RESPONSIVE_SCALES.TABLET;
        }
        
        return Math.round(baseSize * scale);
    }

    /**
     * 根据屏幕尺寸调整文本样式
     */
    public static getResponsiveStyle(
        baseStyle: Phaser.Types.GameObjects.Text.TextStyle,
        screenWidth: number
    ): Phaser.Types.GameObjects.Text.TextStyle {
        const responsiveStyle = { ...baseStyle };
        
        if (typeof responsiveStyle.fontSize === 'number') {
            responsiveStyle.fontSize = PhaserFontConfig.getResponsiveFontSize(
                responsiveStyle.fontSize,
                screenWidth
            );
        }
        
        return responsiveStyle;
    }

    /**
     * 检查字体是否已加载
     */
    public static isFontLoaded(): boolean {
        return PhaserFontConfig.getInstance().fontsLoaded;
    }

    /**
     * 创建带有动画效果的文本
     */
    public static createAnimatedText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        stylePreset: keyof typeof PhaserFontConfig.PRESET_STYLES,
        animationType: 'fadeIn' | 'slideIn' | 'bounceIn' | 'typewriter' = 'fadeIn'
    ): Phaser.GameObjects.Text {
        const textObj = PhaserFontConfig.createText(scene, x, y, text, stylePreset);
        
        switch (animationType) {
        case 'fadeIn':
            textObj.setAlpha(0);
            scene.tweens.add({
                targets: textObj,
                alpha: 1,
                duration: 500,
                ease: 'Power2.easeOut'
            });
            break;
            
        case 'slideIn':
            textObj.setY(y + 50).setAlpha(0);
            scene.tweens.add({
                targets: textObj,
                y: y,
                alpha: 1,
                duration: 600,
                ease: 'Back.easeOut'
            });
            break;
            
        case 'bounceIn':
            textObj.setScale(0);
            scene.tweens.add({
                targets: textObj,
                scale: 1,
                duration: 800,
                ease: 'Bounce.easeOut'
            });
            break;
            
        case 'typewriter':
            const originalText = text;
            textObj.setText('');
            let currentLength = 0;
            const typewriterTimer = scene.time.addEvent({
                delay: 50,
                callback: () => {
                    currentLength++;
                    textObj.setText(originalText.substring(0, currentLength));
                    if (currentLength >= originalText.length) {
                        typewriterTimer.destroy();
                    }
                },
                repeat: originalText.length - 1
            });
            break;
        }
        
        return textObj;
    }

    /**
     * 批量更新场景中的所有文本对象字体
     */
    public static updateSceneTextFonts(scene: Phaser.Scene): void {
        scene.children.getChildren().forEach(child => {
            if (child instanceof Phaser.GameObjects.Text) {
                const currentStyle = child.style;
                // 如果当前字体不是阿里字体，则更新
                if (!currentStyle.fontFamily?.includes('Alibaba')) {
                    child.setStyle({
                        ...currentStyle,
                        fontFamily: PhaserFontConfig.FONT_STACKS.SANS
                    });
                }
            }
        });
    }
}

// 导出便捷函数
export const createText = PhaserFontConfig.createText;
export const updateTextStyle = PhaserFontConfig.updateTextStyle;
export const getResponsiveFontSize = PhaserFontConfig.getResponsiveFontSize;
export const createAnimatedText = PhaserFontConfig.createAnimatedText;

// 导出常用样式预设
export const TextStyles = PhaserFontConfig.PRESET_STYLES;
export const FontFamilies = PhaserFontConfig.FONT_FAMILIES;
export const FontStacks = PhaserFontConfig.FONT_STACKS; 
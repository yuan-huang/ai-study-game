import { 
    PhaserTextStyles, 
    createStyledText, 
    updateTextStyle, 
    getResponsiveFontSize 
} from '../config/FontConfig';

/**
 * 字体使用示例场景
 * 展示如何在Phaser游戏中使用阿里开源字体
 */
export class FontUsageExampleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FontUsageExample' });
    }

    create(): void {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // 1. 使用主标题样式
        const mainTitle = createStyledText(
            this,
            centerX,
            100,
            '欢迎来到AI学习游戏',
            'mainTitle'
        );
        mainTitle.setOrigin(0.5);

        // 2. 使用副标题样式
        const subTitle = createStyledText(
            this,
            centerX,
            180,
            '体验阿里开源字体的魅力',
            'subTitle'
        );
        subTitle.setOrigin(0.5);

        // 3. 使用正文样式
        const bodyText = createStyledText(
            this,
            centerX,
            250,
            '这是使用阿里巴巴普惠体的正文内容，具有良好的可读性和现代感。',
            'bodyText'
        );
        bodyText.setOrigin(0.5);

        // 4. 创建按钮文字示例
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x4299e1);
        buttonBg.lineStyle(2, 0x2b6cb0);
        buttonBg.fillRoundedRect(centerX - 290, 325, 180, 50, 5);
        buttonBg.strokeRoundedRect(centerX - 290, 325, 180, 50, 5);
        const buttonText = createStyledText(
            this,
            centerX - 200,
            350,
            '开始游戏',
            'buttonText'
        );
        buttonText.setOrigin(0.5);

        // 5. 创建标签文字示例
        const labelText = createStyledText(
            this,
            centerX + 100,
            330,
            '分数: 0',
            'labelText'
        );
        labelText.setOrigin(0.5);

        // 6. 创建数字文字示例
        const numberText = createStyledText(
            this,
            centerX + 100,
            370,
            '1000',
            'numberText'
        );
        numberText.setOrigin(0.5);

        // 7. 创建装饰文字示例
        const decorativeText = createStyledText(
            this,
            centerX,
            450,
            '書山有路勤為徑',
            'decorativeText'
        );
        decorativeText.setOrigin(0.5);

        // 8. 响应式字体大小示例
        const responsiveText = this.add.text(
            centerX,
            550,
            '响应式字体大小示例',
            {
                fontFamily: 'Alibaba-PuHuiTi',
                fontSize: getResponsiveFontSize(24, this.cameras.main.width),
                color: '#2d3748'
            }
        );
        responsiveText.setOrigin(0.5);

        // 9. 动态更新字体样式示例
        const dynamicText = this.add.text(
            centerX,
            620,
            '点击我改变样式',
            PhaserTextStyles.bodyText
        );
        dynamicText.setOrigin(0.5);
        dynamicText.setInteractive({ useHandCursor: true });
        
        let styleIndex = 0;
        const styles: (keyof typeof PhaserTextStyles)[] = [
            'bodyText', 'mainTitle', 'subTitle', 'buttonText', 'decorativeText'
        ];
        
        dynamicText.on('pointerdown', () => {
            styleIndex = (styleIndex + 1) % styles.length;
            updateTextStyle(dynamicText, styles[styleIndex]);
        });

        // 10. 添加字体信息展示
        this.createFontInfoPanel();

        // 添加返回按钮
        this.createBackButton();
    }

    private createFontInfoPanel(): void {
        const panel = this.add.container(100, 100);
        
        const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
        const title = this.add.text(0, -80, '字体信息', {
            fontFamily: 'Alibaba-Sans',
            fontSize: 20,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const info = this.add.text(0, -20, 
            '• 阿里巴巴普惠体 - 正文\n' +
            '• 阿里妈妈数黑体 - 标题\n' +
            '• 阿里妈妈东方大楷 - 装饰',
            {
                fontFamily: 'Alibaba-PuHuiTi',
                fontSize: 16,
                color: '#ffffff',
                align: 'left',
                lineSpacing: 8
            }
        ).setOrigin(0.5);
        
        panel.add([bg, title, info]);
    }

    private createBackButton(): void {
        const backButton = this.add.graphics();
        backButton.fillStyle(0x718096);
        backButton.lineStyle(2, 0x4a5568);
        backButton.fillRoundedRect(this.cameras.main.width - 150, 30, 100, 40, 5);
        backButton.strokeRoundedRect(this.cameras.main.width - 150, 30, 100, 40, 5);
        backButton.setInteractive(
            new Phaser.Geom.Rectangle(this.cameras.main.width - 150, 30, 100, 40),
            Phaser.Geom.Rectangle.Contains
        );
        
        const backText = createStyledText(
            this,
            this.cameras.main.width - 100,
            50,
            '返回',
            'buttonText'
        );
        backText.setOrigin(0.5);
        
        backButton.on('pointerdown', () => {
            this.scene.start('MainScene');
        });
    }
}

/**
 * 字体工具类示例
 * 提供更多字体相关的实用方法
 */
export class FontUtils {
    /**
     * 创建带背景的文本框
     */
    static createTextBox(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        styleKey: keyof typeof PhaserTextStyles,
        backgroundColor: number = 0x000000,
        alpha: number = 0.8
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);
        
        const textObj = createStyledText(scene, 0, 0, text, styleKey);
        textObj.setOrigin(0.5);
        
        const bounds = textObj.getBounds();
        const bg = scene.add.rectangle(
            0, 0,
            bounds.width + 20,
            bounds.height + 10,
            backgroundColor,
            alpha
        );
        
        container.add([bg, textObj]);
        return container;
    }

    /**
     * 创建打字机效果文本
     */
    static createTypewriterText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        fullText: string,
        styleKey: keyof typeof PhaserTextStyles,
        speed: number = 50
    ): Phaser.GameObjects.Text {
        const textObj = createStyledText(scene, x, y, '', styleKey);
        
        let currentText = '';
        let index = 0;
        
        const timer = scene.time.addEvent({
            delay: speed,
            callback: () => {
                if (index < fullText.length) {
                    currentText += fullText[index];
                    textObj.setText(currentText);
                    index++;
                } else {
                    timer.destroy();
                }
            },
            repeat: fullText.length - 1
        });
        
        return textObj;
    }

    /**
     * 创建渐变色文本效果
     */
    static createGradientText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        styleKey: keyof typeof PhaserTextStyles,
        colors: string[] = ['#ff6b6b', '#4ecdc4', '#45b7d1']
    ): Phaser.GameObjects.Text {
        const textObj = createStyledText(scene, x, y, text, styleKey);
        
        // 使用Phaser的色调调整创建渐变效果
        scene.tweens.add({
            targets: textObj,
            tint: { from: 0xff6b6b, to: 0x45b7d1 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return textObj;
    }

    /**
     * 创建脉冲动画文本
     */
    static createPulseText(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        styleKey: keyof typeof PhaserTextStyles
    ): Phaser.GameObjects.Text {
        const textObj = createStyledText(scene, x, y, text, styleKey);
        
        scene.tweens.add({
            targets: textObj,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return textObj;
    }
} 
import { BaseScene } from './BaseScene';

interface UIConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    padding: number;
    backgroundColor: number;
    borderColor: number;
    borderWidth: number;
}

export class UIScene extends BaseScene {
    private healthBar!: Phaser.GameObjects.Graphics;
    private experienceBar!: Phaser.GameObjects.Graphics;
    private levelText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;

    private readonly healthBarConfig: UIConfig = {
        x: 20,
        y: 20,
        width: 200,
        height: 20,
        padding: 2,
        backgroundColor: 0x444444,
        borderColor: 0x000000,
        borderWidth: 2
    };

    private readonly expBarConfig: UIConfig = {
        x: 20,
        y: 50,
        width: 200,
        height: 10,
        padding: 1,
        backgroundColor: 0x444444,
        borderColor: 0x000000,
        borderWidth: 1
    };

    constructor() {
        super('UIScene');
    }

    create(): void {
        super.create();

        // 创建UI元素
        this.createHealthBar();
        this.createExperienceBar();
        this.createTexts();

        // 监听事件
        const gameScene = this.scene.get('GamePlayScene');
        gameScene.events.on('updateHealth', this.updateHealthBar, this);
        gameScene.events.on('updateExperience', this.updateExperienceBar, this);
        gameScene.events.on('updateLevel', this.updateLevel, this);
        gameScene.events.on('updateScore', this.updateScore, this);
    }

    private createHealthBar(): void {
        this.healthBar = this.add.graphics();
        this.updateHealthBar(100); // 初始生命值
    }

    private createExperienceBar(): void {
        this.experienceBar = this.add.graphics();
        this.updateExperienceBar(0); // 初始经验值
    }

    private createTexts(): void {
        // 等级文本
        this.levelText = this.add.text(230, 20, 'Level: 1', {
            fontSize: '16px',
            color: '#ffffff'
        });

        // 分数文本
        this.scoreText = this.add.text(230, 45, 'Score: 0', {
            fontSize: '16px',
            color: '#ffffff'
        });
    }

    private updateHealthBar(value: number): void {
        this.healthBar.clear();

        // 绘制边框
        this.healthBar.lineStyle(
            this.healthBarConfig.borderWidth,
            this.healthBarConfig.borderColor
        );
        this.healthBar.strokeRect(
            this.healthBarConfig.x,
            this.healthBarConfig.y,
            this.healthBarConfig.width,
            this.healthBarConfig.height
        );

        // 绘制背景
        this.healthBar.fillStyle(this.healthBarConfig.backgroundColor);
        this.healthBar.fillRect(
            this.healthBarConfig.x + this.healthBarConfig.padding,
            this.healthBarConfig.y + this.healthBarConfig.padding,
            this.healthBarConfig.width - (this.healthBarConfig.padding * 2),
            this.healthBarConfig.height - (this.healthBarConfig.padding * 2)
        );

        // 绘制生命值
        const healthWidth = (this.healthBarConfig.width - (this.healthBarConfig.padding * 2)) * (value / 100);
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(
            this.healthBarConfig.x + this.healthBarConfig.padding,
            this.healthBarConfig.y + this.healthBarConfig.padding,
            healthWidth,
            this.healthBarConfig.height - (this.healthBarConfig.padding * 2)
        );
    }

    private updateExperienceBar(value: number): void {
        this.experienceBar.clear();

        // 绘制边框
        this.experienceBar.lineStyle(
            this.expBarConfig.borderWidth,
            this.expBarConfig.borderColor
        );
        this.experienceBar.strokeRect(
            this.expBarConfig.x,
            this.expBarConfig.y,
            this.expBarConfig.width,
            this.expBarConfig.height
        );

        // 绘制背景
        this.experienceBar.fillStyle(this.expBarConfig.backgroundColor);
        this.experienceBar.fillRect(
            this.expBarConfig.x + this.expBarConfig.padding,
            this.expBarConfig.y + this.expBarConfig.padding,
            this.expBarConfig.width - (this.expBarConfig.padding * 2),
            this.expBarConfig.height - (this.expBarConfig.padding * 2)
        );

        // 绘制经验值
        const expWidth = (this.expBarConfig.width - (this.expBarConfig.padding * 2)) * (value / 100);
        this.experienceBar.fillStyle(0x00ffff);
        this.experienceBar.fillRect(
            this.expBarConfig.x + this.expBarConfig.padding,
            this.expBarConfig.y + this.expBarConfig.padding,
            expWidth,
            this.expBarConfig.height - (this.expBarConfig.padding * 2)
        );
    }

    private updateLevel(level: number): void {
        this.levelText.setText(`Level: ${level}`);
    }

    private updateScore(score: number): void {
        this.scoreText.setText(`Score: ${score}`);
    }

    public destroy(): void {
        // 清理事件监听
        const gameScene = this.scene.get('GamePlayScene');
        gameScene.events.off('updateHealth', this.updateHealthBar, this);
        gameScene.events.off('updateExperience', this.updateExperienceBar, this);
        gameScene.events.off('updateLevel', this.updateLevel, this);
        gameScene.events.off('updateScore', this.updateScore, this);
    }
} 
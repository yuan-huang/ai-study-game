import { BaseScene } from './BaseScene';

export class LoadingScene extends BaseScene {
    private loadingText?: Phaser.GameObjects.Text;
    private progressBar?: Phaser.GameObjects.Graphics;
    private progressBarBg?: Phaser.GameObjects.Graphics;

    constructor() {
        super('LoadingScene');
    }

    preload(): void {
        this.createLoadingUI();
        
        // 设置加载进度监听
        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        
        // 这里可以加载游戏资源
        // this.load.image('background', 'assets/images/background.png');
        // this.load.audio('bgm', 'assets/audio/background.mp3');
    }

    create(): void {
        super.create();
        // 加载完成后的逻辑
        console.log('加载场景创建完成');
    }

    private createLoadingUI(): void {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // 创建加载文本
        this.loadingText = this.add.text(centerX, centerY - 50, '加载中...', {
            fontSize: '32px',
            color: '#ffffff'
        });
        this.loadingText.setOrigin(0.5);

        // 创建进度条背景
        this.progressBarBg = this.add.graphics();
        this.progressBarBg.fillStyle(0x333333);
        this.progressBarBg.fillRect(centerX - 200, centerY + 20, 400, 20);

        // 创建进度条
        this.progressBar = this.add.graphics();
    }

    private onLoadProgress(progress: number): void {
        if (this.progressBar && this.loadingText) {
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;

            // 更新进度条
            this.progressBar.clear();
            this.progressBar.fillStyle(0x4caf50);
            this.progressBar.fillRect(centerX - 200, centerY + 20, 400 * progress, 20);

            // 更新加载文本
            this.loadingText.setText(`加载中... ${Math.round(progress * 100)}%`);
        }
    }

    private onLoadComplete(): void {
        console.log('加载完成');
        // 可以在这里添加过渡到下一个场景的逻辑
        // this.scene.start('LoginScene');
    }
} 
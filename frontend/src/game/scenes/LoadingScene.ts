import { BaseScene } from './BaseScene';
import { AssetManager } from '../managers/AssetManager';

export class LoadingScene extends BaseScene {
    private loadingBar!: Phaser.GameObjects.Graphics;
    private loadingText!: Phaser.GameObjects.Text;

    constructor() {
        super('LoadingScene');
    }

    preload(): void {
        this.createLoadingBar();

        // 注册加载进度事件
        this.load.on('progress', this.updateLoadingBar, this);
        this.load.on('complete', this.onLoadComplete, this);

        // 加载资源
        this.loadAssets();
    }

    private createLoadingBar(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 创建加载文本
        this.loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.loadingText.setOrigin(0.5);

        // 创建加载进度条
        this.loadingBar = this.add.graphics();
        this.loadingBar.setPosition(width / 2 - 160, height / 2);
    }

    private updateLoadingBar(value: number): void {
        this.loadingBar.clear();

        // 进度条背景
        this.loadingBar.fillStyle(0x444444);
        this.loadingBar.fillRect(0, 0, 320, 30);

        // 进度条
        this.loadingBar.fillStyle(0x00ff00);
        this.loadingBar.fillRect(2, 2, 316 * value, 26);

        // 更新加载文本
        this.loadingText.setText(`加载中... ${Math.round(value * 100)}%`);
    }

    private loadAssets(): void {
        // 加载游戏资源
        AssetManager.loadAll(this);
    }

    private onLoadComplete(): void {
        this.loadingText.setText('加载完成！');
        
        // 延迟一下，让用户看到加载完成的状态
        this.time.delayedCall(1000, () => {
            this.scene.start('MainMenuScene');
        });
    }
} 
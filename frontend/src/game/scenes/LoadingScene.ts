import { BaseScene } from './BaseScene';
import { AssetLoader } from '../utils/AssetLoader';
import { GameAssets } from '../config/AssetConfig';

export class LoadingScene extends BaseScene {
    private loadingBar!: Phaser.GameObjects.Graphics;
    private loadingText!: Phaser.GameObjects.Text;
    private assetLoader!: AssetLoader;

    constructor() {
        super('LoadingScene');
    }

    preload(): void {
        this.createLoadingBar();
        this.setupAssetLoader();

        // 加载所有场景的资源
        this.loadAllScenes();
    }

    private createLoadingBar(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 创建加载文本
        this.loadingText = this.add.text(width / 2, height / 2 - 50, '加载中...', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.loadingText.setOrigin(0.5);

        // 创建加载进度条
        this.loadingBar = this.add.graphics();
        this.loadingBar.setPosition(width / 2 - 160, height / 2);

        // 绘制进度条边框
        this.loadingBar.lineStyle(2, 0xffffff);
        this.loadingBar.strokeRoundedRect(0, 0, 320, 30, 5);
    }

    private setupAssetLoader(): void {
        this.assetLoader = new AssetLoader(this);
        
        // 添加加载进度监听
        this.assetLoader.addLoadingListeners(
            // 进度更新
            (value: number) => {
                this.updateLoadingBar(value);
            },
            // 加载完成
            () => {
                this.onLoadComplete();
            }
        );
    }

    private loadAllScenes(): void {
        // 获取所有场景名称
        const sceneNames = Object.keys(GameAssets);
        
        // 加载所有场景的资源
        this.assetLoader.loadMultipleScenes(sceneNames);
    }

    private updateLoadingBar(value: number): void {
        this.loadingBar.clear();

        // 绘制进度条边框
        this.loadingBar.lineStyle(2, 0xffffff);
        this.loadingBar.strokeRoundedRect(0, 0, 320, 30, 5);

        // 进度条背景
        this.loadingBar.fillStyle(0x444444);
        this.loadingBar.fillRoundedRect(0, 0, 320, 30, 5);

        // 进度条
        this.loadingBar.fillStyle(0x00ff00);
        this.loadingBar.fillRoundedRect(2, 2, 316 * value, 26, 4);

        // 更新加载文本
        const percent = Math.round(value * 100);
        this.loadingText.setText(`加载中... ${percent}%`);
    }

    private onLoadComplete(): void {
        this.loadingText.setText('加载完成！');
        
        // 添加闪烁效果
        this.tweens.add({
            targets: this.loadingText,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                // 延迟一下，让用户看到加载完成的状态
                this.time.delayedCall(500, () => {
                    this.scene.start('LoginScene');
                });
            }
        });
    }

    // 场景销毁时清理资源
    destroy(): void {
        if (this.loadingBar) {
            this.loadingBar.destroy();
        }
        if (this.loadingText) {
            this.loadingText.destroy();
        }
        // 移除所有事件监听
        this.load.off('progress');
        this.load.off('complete');
    }
} 
import 'phaser';
import { Game } from 'phaser';
import { GameConfig } from './config/GameConfig';
import { AssetLoader } from './utils/AssetLoader';
import { GameAssets } from './config/AssetConfig';

export class KnowledgeGarden {
    private game: Game;
    private assetLoader: AssetLoader | null = null;

    constructor(containerId: string) {

        // 更新配置中的容器ID
        const config = {
            ...GameConfig,
            parent: containerId
        };

        // 创建游戏实例
        this.game = new Game(config);

        // 监听场景创建事件
        this.game.events.on('createscene', (scene: Phaser.Scene) => {
            // 为每个场景创建资源加载器
            this.assetLoader = new AssetLoader(scene);
            
            // 根据场景类型加载对应资源
            const sceneName = scene.scene.key;
            this.assetLoader.loadSceneAssets(sceneName);
            
            // 添加加载进度监听
            this.assetLoader.addLoadingListeners(
                (progress) => {
                    console.log(`Loading progress: ${Math.round(progress * 100)}%`);
                },
                () => {
                    console.log(`Scene ${sceneName} assets loaded completely`);
                }
            );
        });
    }

    public destroy(): void {
        // 清理事件监听
        this.game.events.removeAllListeners();
        // 销毁游戏实例
        this.game.destroy(true);
    }
} 
import { Scene } from 'phaser';
import { AssetType, GameAssets } from '../config/AssetConfig';

export class AssetLoader {
    private scene: Scene;
    private assetPrefix: string;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // 加载场景资源
    public loadSceneAssets(sceneName: string): void {
        const assets = GameAssets[sceneName];
        if (!assets) {
            console.warn(`No assets found for scene: ${sceneName}`);
            return;
        }

        assets.forEach(asset => {
            const fullPath = this.assetPrefix + asset.path;
            
            switch (asset.type) {
                case AssetType.IMAGE:
                    this.scene.load.image(asset.key, fullPath);
                    break;
                    
                case AssetType.AUDIO:
                    this.scene.load.audio(asset.key, fullPath);
                    break;
                    
                case AssetType.SPRITE:
                    if (asset.frameConfig) {
                        this.scene.load.spritesheet(
                            asset.key,
                            fullPath,
                            asset.frameConfig
                        );
                    }
                    break;
                    
                default:
                    console.warn(`Unknown asset type for: ${asset.key}`);
            }
        });
    }

    // 加载多个场景的资源
    public loadMultipleScenes(sceneNames: string[]): void {
        sceneNames.forEach(sceneName => this.loadSceneAssets(sceneName));
    }

    // 加载特定类型的资源
    public loadAssetsByType(type: AssetType): void {
        Object.values(GameAssets).forEach(sceneAssets => {
            sceneAssets
                .filter(asset => asset.type === type)
                .forEach(asset => {
                    const fullPath = this.assetPrefix + asset.path;
                    switch (type) {
                        case AssetType.IMAGE:
                            this.scene.load.image(asset.key, fullPath);
                            break;
                        case AssetType.AUDIO:
                            this.scene.load.audio(asset.key, fullPath);
                            break;
                        case AssetType.SPRITE:
                            if (asset.frameConfig) {
                                this.scene.load.spritesheet(
                                    asset.key,
                                    fullPath,
                                    asset.frameConfig
                                );
                            }
                            break;
                    }
                });
        });
    }

    // 添加加载进度监听
    public addLoadingListeners(
        onProgress?: (value: number) => void,
        onComplete?: () => void
    ): void {
        if (onProgress) {
            this.scene.load.on('progress', (value: number) => {
                onProgress(value);
            });
        }

        if (onComplete) {
            this.scene.load.on('complete', onComplete);
        }
    }
} 
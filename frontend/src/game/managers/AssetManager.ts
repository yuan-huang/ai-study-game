import { Scene } from 'phaser';

interface AssetConfig {
    key: string;
    path: string;
    type: 'image' | 'spritesheet' | 'audio' | 'json';
    options?: any;
}

export class AssetManager {
    private static readonly assets: AssetConfig[] = [
        // 玩家资源
        {
            key: 'player',
            path: 'assets/sprites/player.png',
            type: 'spritesheet',
            options: { frameWidth: 64, frameHeight: 64 }
        },
        // UI资源
        {
            key: 'ui-button',
            path: 'assets/ui/button.png',
            type: 'image'
        },
        // 背景资源
        {
            key: 'background',
            path: 'assets/backgrounds/main.png',
            type: 'image'
        },
        // 音频资源
        {
            key: 'bgm',
            path: 'assets/audio/bgm.mp3',
            type: 'audio'
        },
        // 数据资源
        {
            key: 'game-config',
            path: 'assets/data/game-config.json',
            type: 'json'
        }
    ];

    public static loadAll(scene: Scene): void {
        this.assets.forEach(asset => {
            switch (asset.type) {
                case 'image':
                    scene.load.image(asset.key, asset.path);
                    break;
                case 'spritesheet':
                    scene.load.spritesheet(asset.key, asset.path, asset.options);
                    break;
                case 'audio':
                    scene.load.audio(asset.key, asset.path);
                    break;
                case 'json':
                    scene.load.json(asset.key, asset.path);
                    break;
            }
        });
    }

    public static getAssetPath(key: string): string {
        const asset = this.assets.find(a => a.key === key);
        return asset ? asset.path : '';
    }

    public static getAssetConfig(key: string): AssetConfig | undefined {
        return this.assets.find(a => a.key === key);
    }
} 
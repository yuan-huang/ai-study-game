import 'phaser';
import { Game } from 'phaser';
import { GameConfig } from './config/GameConfig';

export class KnowledgeGarden {
    private game: Game;

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

        });
    }

    public destroy(): void {
        // 清理事件监听
        this.game.events.removeAllListeners();
        // 销毁游戏实例
        this.game.destroy(true);
    }
} 
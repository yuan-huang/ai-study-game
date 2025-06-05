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
    }

    public destroy(): void {
        this.game.destroy(true);
    }
} 
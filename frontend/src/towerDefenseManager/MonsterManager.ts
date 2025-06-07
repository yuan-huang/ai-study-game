import { getAssetPath } from '@/config/AssetConfig';
import { EnemyType } from '@/types/towerDefenseScene';
import { Monster } from '@/entities/TowerDefense/Monster';
import { PathManager } from './PathManager';

export class MonsterManager {
    private scene: Phaser.Scene;
    private gameContainer: Phaser.GameObjects.Container;
    private pathManager: PathManager;
    private enemies: Monster[] = [];

    // 敌人类型配置
    private enemyTypes: { [key: string]: EnemyType } = {
        "monster-normal": {
            type: 'monster-normal',
            health: 50,
            speed: 100,
            reward: 1,
            image: getAssetPath('monster-normal')
        },
        "monster-gluttonous": {
            type: 'monster-gluttonous',
            health: 80,
            speed: 80,
            reward: 2,
            image: getAssetPath('monster-gluttonous')
        },
        "monster-grumpy": {
            type: 'monster-grumpy',
            health: 120,
            speed: 60,
            reward: 3,
            image: getAssetPath('monster-grumpy')
        },
        "monster-lazy": {
            type: 'monster-lazy',
            health: 100,
            speed: 40,
            reward: 3,
            image: getAssetPath('monster-lazy')
        },
        "monster-messy": {
            type: 'monster-messy',
            health: 60,
            speed: 120,
            reward: 2,
            image: getAssetPath('monster-messy')
        }
    };

    constructor(scene: Phaser.Scene, gameContainer: Phaser.GameObjects.Container, pathManager: PathManager) {
        this.scene = scene;
        this.gameContainer = gameContainer;
        this.pathManager = pathManager;
    }

    public spawnEnemy(type: string): void {
        const enemyType = this.enemyTypes[type];
        const startPoint = this.pathManager.getStartPoint();
        
        if (!startPoint) {
            console.error('路径起点未找到');
            return;
        }
        
        // 创建怪物
        const monster = new Monster(this.scene, startPoint.x, startPoint.y, enemyType, this.pathManager.getPath());
        monster.setScale(0.2); // 设置怪物的缩放比例
        this.gameContainer.add(monster);
        this.enemies.push(monster);
    }

    public update(delta: number, gameSpeed: number = 1): void {
        // 更新所有怪物
        this.enemies.forEach(monster => {
            monster.update(delta, gameSpeed);
        });
    }

    public getEnemies(): Monster[] {
        return this.enemies;
    }

    public removeEnemy(monster: Monster): void {
        const index = this.enemies.indexOf(monster);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        monster.destroy();
    }

    public getWaveMonsters(wave: number): Array<{icon: string, name: string, count: number, type: string}> {
        // 波次配置 - 每波固定10个怪物
        const waveConfig: { [key: number]: Array<{icon: string, name: string, type: string, count: number}> } = {
            1: [
                { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 10 }
            ],
            2: [
                { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 10 }
            ],
            3: [
                { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 8 },
                { icon: '👹', name: '加强兵', type: 'monster-gluttonous', count: 2 }
            ],
            4: [
                { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 6 },
                { icon: '👹', name: '加强兵', type: 'monster-gluttonous', count: 3 },
                { icon: '🚶', name: '懒惰兵', type: 'monster-lazy', count: 1 }
            ],
            5: [
                { icon: '🐙', name: '小怪兵', type: 'monster-normal', count: 6 },
                { icon: '👹', name: '加强兵', type: 'monster-gluttonous', count: 2 },
                { icon: '💨', name: '快速兵', type: 'monster-messy', count: 1 },
                { icon: '👾', name: 'BOSS', type: 'monster-grumpy', count: 1 }
            ]
        };
        
        // 获取当前波次配置，如果超出配置范围，使用最后一波的配置
        return waveConfig[wave] || waveConfig[5];
    }

    public generateWaveEnemies(wave: number): string[] {
        const monsters = this.getWaveMonsters(wave);
        const currentWaveEnemies: string[] = [];
        
        monsters.forEach(monster => {
            for (let i = 0; i < monster.count; i++) {
                currentWaveEnemies.push(monster.type);
            }
        });
        
        // 打乱敌人出现顺序，增加游戏的随机性
        Phaser.Utils.Array.Shuffle(currentWaveEnemies);
        
        return currentWaveEnemies;
    }

    public getEnemyTypes(): { [key: string]: EnemyType } {
        return this.enemyTypes;
    }

    public destroy(): void {
        this.enemies.forEach(monster => monster.destroy());
        this.enemies = [];
    }
}

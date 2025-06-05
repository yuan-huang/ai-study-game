import { Scene } from 'phaser';
import { TowerDefenseLevelData } from '../../config/GameConfig';
import { getAssetPath } from '../../config/AssetConfig';

export class TowerDefenseScene extends Scene {
    private levelConfig!: TowerDefenseLevelData;

    constructor() {
        super({ key: 'TowerDefenseScene' });
    }

    init(data: { levelConfig: TowerDefenseLevelData }) {
        this.levelConfig = data.levelConfig;
    }

    preload() {
        // 加载塔防游戏资源
        this.load.image('tower-base', getAssetPath('tower-base'));
        this.load.image('tower-turret', getAssetPath('tower-turret'));
        this.load.spritesheet('monster', getAssetPath('monster'), {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.image('projectile', getAssetPath('projectile'));
    }

    create() {
        // 添加返回按钮
        this.createBackButton();

        // 添加游戏UI
        this.createGameUI();

        // 初始化游戏系统
        this.initializeGameSystems();
    }

    private createBackButton() {
        const backButton = this.add.text(50, 50, '返回地图', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 }
        }).setInteractive();

        backButton.on('pointerup', () => {
            this.scene.start('LevelSelectScene', { 
                subject: this.levelConfig.subject 
            });
        });
    }

    private createGameUI() {
        // 添加分数显示
        this.add.text(this.cameras.main.width - 200, 50, '分数: 0', {
            fontSize: '32px',
            color: '#ffffff'
        });

        // 添加波次显示
        this.add.text(this.cameras.main.width - 200, 100, '波次: 1/3', {
            fontSize: '32px',
            color: '#ffffff'
        });

        // 添加塔防建造UI
        this.createTowerUI();
    }

    private createTowerUI() {
        // TODO: 实现塔防建造界面
    }

    private initializeGameSystems() {
        // TODO: 初始化游戏系统
        // 1. 怪物生成系统
        // 2. 塔防放置系统
        // 3. 路径系统
        // 4. 战斗系统
        // 5. 题目系统
    }

    update() {
        // TODO: 更新游戏逻辑
    }
} 
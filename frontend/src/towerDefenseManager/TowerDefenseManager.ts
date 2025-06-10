import { TowerManager } from './TowerManager';

import { TowerDefenseGameState, UserConfig } from '@/types/towerDefenseScene';
import { Projectile } from '@/entities/TowerDefense/Tower';
import { MonsterManager } from './MonsterManager';
import { PathManager } from './PathManager';
import { QuestionManager } from './QuestionManager';
import { ProjectileManager } from './ProjectileManager';

export class TowerDefenseManager {
    private scene: Phaser.Scene;
    private gameContainer: Phaser.GameObjects.Container;
    
    public towerManager: TowerManager;
    public monsterManager: MonsterManager;
    public pathManager: PathManager;
    public questionManager: QuestionManager;
    public projectileManager: ProjectileManager;
    
    private gameState: TowerDefenseGameState;
    private userConfig: UserConfig;

    constructor(
        scene: Phaser.Scene, 
        gameContainer: Phaser.GameObjects.Container,
        gameState: TowerDefenseGameState,
        userConfig: UserConfig,
        gameAreaWidth: number,
        gameAreaHeight: number
    ) {
        this.scene = scene;
        this.gameContainer = gameContainer;
        this.gameState = gameState;
        this.userConfig = userConfig;

        // 初始化路径管理器
        this.pathManager = new PathManager(scene, gameContainer, gameAreaWidth, gameAreaHeight);
        
        // 初始化塔管理器
        this.towerManager = new TowerManager(scene, gameContainer, this.pathManager, gameAreaWidth, gameAreaHeight, 60);
        
        // 设置塔放置回调函数
        this.towerManager.setOnTowerPlacedCallback((x, y, type) => {
            return this.placeTower(x, y, type);
        });
        
        // 初始化怪物管理器
        this.monsterManager = new MonsterManager(scene, gameContainer, this.pathManager);
        
        // 初始化投射物管理器
        this.projectileManager = new ProjectileManager(scene, gameContainer);
        
        // 初始化题目管理器
        this.questionManager = new QuestionManager(userConfig);

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // 监听怪物死亡事件
        this.scene.events.on('enemy-killed', (monster: any) => {
            this.onMonsterKilled(monster);
        });

        // 监听怪物到达终点事件
        this.scene.events.on('enemy-reached-end', (monster: any) => {
            this.onMonsterReachedEnd(monster);
        });

        // 监听塔被点击事件
        this.scene.events.on('tower-clicked', (tower: any) => {
            this.onTowerClicked(tower);
        });
    }

    public async initialize(): Promise<void> {
        // 初始化问题管理器
        await this.questionManager.initialize();
    }

    public initializePath(): void {
        this.pathManager.createAndDrawPath();
    }


    public getNextQuestion() {
        return this.questionManager.getNextQuestion();
    }

    public checkAnswer(answer: string, currentQuestion: any): boolean {
        return this.questionManager.checkAnswer(answer, currentQuestion);
    }

    public canPlaceTower(x: number, y: number): boolean {
        return this.towerManager.canPlaceTower(x, y);
    }

    public placeTower(x: number, y: number, type: string): boolean {
        const cost = this.towerManager.getTowerCost(type);
        console.log(`尝试放置 ${type}，成本: ${cost}，当前积分: ${this.gameState.score}`);
        
        if (this.gameState.score >= cost) {
            const oldScore = this.gameState.score;
            this.gameState.score -= cost;
            console.log(`积分扣除成功：${oldScore} -> ${this.gameState.score}`);
            
            this.towerManager.placeTower(x, y, type);
            
            // 发射事件通知UI更新
            this.scene.events.emit('score-changed', this.gameState.score);
            
            return true;
        } else {
            console.log(`积分不足，无法放置 ${type}！需要 ${cost}，但只有 ${this.gameState.score}`);
            return false;
        }
    }

    public spawnEnemy(type: string): void {
        this.monsterManager.spawnEnemy(type);
    }

    public update(time: number, delta: number): void {
        // 更新怪物
        this.monsterManager.update(delta, this.gameState.gameSpeed);
        
        // 更新塔的攻击
        const enemies = this.monsterManager.getEnemies();
        const projectiles = this.towerManager.updateAttacks(enemies, time);
        
        // 将新投射物添加到投射物管理器
        projectiles.forEach((projectile: Projectile) => {
            this.projectileManager.addProjectile(projectile);
        });
        
        // 更新投射物
        this.projectileManager.update(delta);
    }

    private onMonsterKilled(monster: any): void {
        // 奖励积分
        this.gameState.score += monster.enemyType.reward || 10;
        
        // 移除怪物
        this.monsterManager.removeEnemy(monster);
        
        // 创建爆炸效果
        this.createExplosion(monster.x, monster.y);
    }

    private onMonsterReachedEnd(monster: any): void {
        // 扣除生命值
        this.gameState.health--;
        
        // 移除怪物
        this.monsterManager.removeEnemy(monster);
    }

    private onTowerClicked(tower: any): void {
        // 显示塔的信息或升级选项
        this.showTowerInfo(tower);
    }

    private createExplosion(x: number, y: number): void {
        // 创建简单的爆炸效果
        for (let i = 0; i < 10; i++) {
            const particle = this.scene.add.circle(x, y, 5, 0xffff00);
            
            const angle = (Math.PI * 2 / 10) * i;
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    private showTowerInfo(tower: any): void {
        // 计算塔在屏幕上的实际位置 (考虑游戏容器的偏移)
        const towerWorldX = tower.x;
        const towerWorldY = tower.y + 60; // 加上状态栏高度
        
        // 创建信息面板
        const infoPanel = this.scene.add.container(towerWorldX, towerWorldY - 80);
        
        // 背景
        const background = this.scene.add.rectangle(0, 0, 200, 120, 0x000000, 0.8);
        background.setStrokeStyle(2, 0xffffff, 0.5);
        background.setRounded(10);
        
        // 塔信息文本
        const infoText = this.scene.add.text(0, 0, tower.getInfo(), {
            fontSize: '24px',
            color: '#ffffff',
            align: "left",
            wordWrap: { width: 180, useAdvancedWrap: true }
        }).setOrigin(0.5);
        
        infoPanel.add([background, infoText]);
        
        // 确保信息面板在最上层
        infoPanel.setDepth(1000);
        
        // 3秒后自动消失
        this.scene.tweens.add({
            targets: infoPanel,
            alpha: 0,
            y: infoPanel.y - 20,
            duration: 2000,
            delay: 1000,
            onComplete: () => {
                infoPanel.destroy();
            }
        });
    }

    public enterPlacementMode(towerType: string): void {
        this.towerManager.enterPlacementMode(towerType);
    }

    public exitPlacementMode(): void {
        this.towerManager.exitPlacementMode();
    }

    public getTowerTypes() {
        return this.towerManager.getTowerTypes();
    }

    public getWaveMonsters(wave: number) {
        return this.monsterManager.getWaveMonsters(wave);
    }

    public destroy(): void {
        this.towerManager.destroy();
        this.monsterManager.destroy();
        this.projectileManager.destroy();
        this.pathManager.destroy();
    }

    public isQuestionsExhausted(): boolean {
        return this.questionManager.isQuestionsExhausted();
    }

    public getAnsweredQuestionIds(): string[] {
        return this.questionManager.getAnsweredQuestionIds();
    }
}

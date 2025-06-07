// 管理塔的创建和升级

import { getAssetPath } from '@/config/AssetConfig';
import { TowerType } from '@/types/towerDefenseScene';
import { Tower, Projectile } from '@/entities/TowerDefense/Tower';
import { Monster } from '@/entities/TowerDefense/Monster';
import { PathManager } from './PathManager';

export class TowerManager {
    private scene: Phaser.Scene;
    private gameContainer: Phaser.GameObjects.Container;
    private pathManager: PathManager;
    
    private towers: Tower[] = [];
    private selectedTowerType: string | null = null;
    private placementMode = false;
    private placementIndicator?: Phaser.GameObjects.Image;
    private rangeIndicator?: Phaser.GameObjects.Graphics;
    private onTowerPlaced?: (x: number, y: number, type: string) => boolean;
    
    // 游戏区域尺寸
    private gameAreaWidth: number;
    private gameAreaHeight: number;
    private statusBarHeight: number;
    
    // 塔类型配置
    private towerTypes: { [key: string]: TowerType } = {
        "tower-arrow": {
            type: 'tower-arrow',
            name: '箭塔',
            cost: 50,
            damage: 20,
            range: 150,
            fireRate: 1000,
            level: 1,
            maxLevel: 10,
            image: getAssetPath('tower-arrow'),
            icon: '🏹'
        },
        "tower-freeze": {
            type: 'tower-freeze',
            name: '冰冻塔',
            cost: 70,
            damage: 15,
            range: 150,
            fireRate: 1500,
            level: 1,
            maxLevel: 10,
            image: getAssetPath('tower-freeze'),
            icon: '❄️'
        },
        "tower-laser": {
            type: 'tower-laser',
            name: '激光塔',
            cost: 100,
            damage: 30,
            range: 180,
            fireRate: 800,
            level: 1,
            maxLevel: 10,
            image: getAssetPath('tower-laser'),
            icon: '⚡'
        },
        "tower-poison": {
            type: 'tower-poison',
            name: '毒塔',
            cost: 70,
            damage: 10,
            range: 140,
            fireRate: 500,
            level: 1,
            maxLevel: 10,
            image: getAssetPath('tower-poison'),
            icon: '☠️'
        }
    };

    constructor(scene: Phaser.Scene, gameContainer: Phaser.GameObjects.Container, pathManager: PathManager, gameAreaWidth: number = 1400, gameAreaHeight: number = 1000, statusBarHeight: number = 60) {
        this.scene = scene;
        this.gameContainer = gameContainer;
        this.pathManager = pathManager;
        this.gameAreaWidth = gameAreaWidth;
        this.gameAreaHeight = gameAreaHeight;
        this.statusBarHeight = statusBarHeight;
        
        this.setupPlacementSystem();
    }

    public setOnTowerPlacedCallback(callback: (x: number, y: number, type: string) => boolean): void {
        this.onTowerPlaced = callback;
    }

    private setupPlacementSystem(): void {
        // 创建放置指示器 - 使用默认图像
        this.placementIndicator = this.scene.add.image(0, 0, 'tower-arrow');
        this.placementIndicator.setAlpha(0.5);
        this.placementIndicator.setVisible(false);
        this.placementIndicator.setScale(0.2);
        
        // 创建范围指示器
        this.rangeIndicator = this.scene.add.graphics();
        this.rangeIndicator.setVisible(false);

        this.setupInputListeners();
    }

    private setupInputListeners(): void {
        // 监听鼠标移动
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.placementMode && this.placementIndicator) {
                this.placementIndicator.setPosition(pointer.x, pointer.y);
                
                // 更新范围指示器
                if (this.selectedTowerType && this.rangeIndicator) {
                    const towerType = this.towerTypes[this.selectedTowerType];
                    this.rangeIndicator.clear();
                    this.rangeIndicator.lineStyle(3, 0xff6666, 0.6);
                    this.rangeIndicator.fillStyle(0xff6666, 0.1);
                    this.rangeIndicator.strokeCircle(pointer.x, pointer.y, towerType.range);
                    this.rangeIndicator.fillCircle(pointer.x, pointer.y, towerType.range);
                }
            }
        });
        
        // 监听点击事件
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.placementMode && this.selectedTowerType) {
                console.log(`点击位置: (${pointer.x}, ${pointer.y})，塔类型: ${this.selectedTowerType}`);
                
                // 检查是否点击在游戏区域内（不是UI区域）
                // 如果点击在右侧UI区域，忽略此次点击
                if (pointer.x > this.gameAreaWidth) {
                    console.log('点击在UI区域，忽略此次点击');
                    return;
                }
                
                const gameContainerX = pointer.x;
                const gameContainerY = pointer.y - this.statusBarHeight; // 减去状态栏高度
                
                console.log(`游戏区域坐标: (${gameContainerX}, ${gameContainerY})`);
                
                // 确保点击在游戏区域内
                if (gameContainerY < 0) {
                    console.log('点击在状态栏区域，忽略此次点击');
                    return;
                }
                
                if (this.canPlaceTower(gameContainerX, gameContainerY)) {
                    console.log('位置检查通过，尝试放置塔');
                    
                    // 调用回调函数来处理积分扣除和塔的创建
                    if (this.onTowerPlaced) {
                        console.log('调用回调函数处理塔放置');
                        if (this.onTowerPlaced(gameContainerX, gameContainerY, this.selectedTowerType)) {
                            console.log('塔放置成功，退出放置模式');
                            this.exitPlacementMode();
                        } else {
                            console.log('塔放置失败，积分不足');
                            // 积分不足，发射事件通知
                            this.scene.events.emit('insufficient-score');
                        }
                    } else {
                        console.log('没有回调函数，直接创建塔');
                        // 如果没有回调函数，直接创建塔（向后兼容）
                        this.placeTower(gameContainerX, gameContainerY, this.selectedTowerType);
                        this.exitPlacementMode();
                    }
                } else {
                    console.log('位置检查失败，不能放置塔');
                    // 不能放置塔，发射事件通知
                    this.scene.events.emit('invalid-placement');
                }
            }
        });
        
        // ESC键取消放置
        this.scene.input.keyboard?.on('keydown-ESC', () => {
            if (this.placementMode) {
                this.exitPlacementMode();
            }
        });
    }

    public canPlaceTower(x: number, y: number): boolean {
        // 检查是否离路径太近
        const path = this.pathManager.getPath();
        for (let i = 0; i < path.length - 1; i++) {
            const dist = Phaser.Geom.Line.GetNearestPoint(
                new Phaser.Geom.Line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y),
                new Phaser.Geom.Point(x, y),
                new Phaser.Geom.Point()
            );
            if (Phaser.Math.Distance.Between(x, y, dist.x, dist.y) < 40) {
                return false;
            }
        }
        
        // 检查是否与其他塔重叠
        for (const tower of this.towers) {
            if (Phaser.Math.Distance.Between(x, y, tower.x, tower.y) < 60) {
                return false;
            }
        }
        
        return true;
    }

    public placeTower(x: number, y: number, type: string): void {
        const towerType = this.towerTypes[type];
        
        // 创建塔
        const tower = new Tower(this.scene, x, y, towerType);
        tower.setScale(0.2);
        tower.setOrigin(0.5, 0.5);
        this.gameContainer.add(tower);
        this.towers.push(tower);
        
        // 默认显示攻击范围
        tower.showRangePermanently();
        
        console.log(`放置了${towerType.name}，攻击范围: ${towerType.range}像素`);
    }

    public getTowerCost(type: string): number {
        const cost = this.towerTypes[type]?.cost || 0;
        console.log(`获取塔 ${type} 的成本: ${cost}`);
        return cost;
    }

    public getTowerTypes(): { [key: string]: TowerType } {
        return this.towerTypes;
    }

    public enterPlacementMode(towerType: string): void {
        this.placementMode = true;
        this.selectedTowerType = towerType;
        
        if (this.placementIndicator) {
            // 根据塔类型更新放置指示器的图像
            try {
                this.placementIndicator.setTexture(towerType);
            } catch (error) {
                console.warn(`无法设置塔图像 ${towerType}，使用默认图像`);
                this.placementIndicator.setTexture('tower-arrow');
            }
            this.placementIndicator.setVisible(true);
        }
        if (this.rangeIndicator) {
            this.rangeIndicator.setVisible(true);
        }
        
        console.log(`进入塔放置模式: ${towerType}`);
    }

    public exitPlacementMode(): void {
        this.placementMode = false;
        this.selectedTowerType = null;
        
        if (this.placementIndicator) {
            this.placementIndicator.setVisible(false);
        }
        if (this.rangeIndicator) {
            this.rangeIndicator.setVisible(false);
            this.rangeIndicator.clear();
        }
        
        console.log('退出塔放置模式');
    }

    public updateAttacks(enemies: Monster[], currentTime: number): Projectile[] {
        const newProjectiles: Projectile[] = [];
        
        this.towers.forEach(tower => {
            const target = tower.findTarget(enemies);
            if (target) {
                const projectile = tower.attack(target, currentTime);
                if (projectile) {
                    newProjectiles.push(projectile);
                }
            }
        });
        
        return newProjectiles;
    }

    public getTowers(): Tower[] {
        return this.towers;
    }

    public removeTower(tower: Tower): void {
        const index = this.towers.indexOf(tower);
        if (index > -1) {
            this.towers.splice(index, 1);
        }
        tower.destroy();
    }

    public destroy(): void {
        this.towers.forEach(tower => tower.destroy());
        this.towers = [];
        
        if (this.placementIndicator) {
            this.placementIndicator.destroy();
        }
        if (this.rangeIndicator) {
            this.rangeIndicator.destroy();
        }
    }
}


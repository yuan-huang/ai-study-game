import { Monster } from './Monster';
import { TowerType } from '@/types/towerDefenseScene';

/**
 * 投射物类
 */
export class Projectile extends Phaser.GameObjects.Image {
    public target: Monster;
    public damage: number;
    public speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Monster, damage: number) {
        super(scene, x, y, 'projectile');
        
        this.target = target;
        this.damage = damage;
        this.speed = 500;
        
        // 创建投射物纹理
        if (!scene.textures.exists('projectile')) {
            this.createDefaultTexture();
        }
        
        this.setScale(0.2);
        scene.add.existing(this);
    }

    private createDefaultTexture(): void {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(0, 0, 10);
        graphics.generateTexture('projectile', 20, 20);
        graphics.destroy();
        this.setTexture('projectile');
    }

    public update(delta: number): boolean {
        if (!this.target || !this.target.active) {
            this.destroy();
            return false;
        }
        
        // 移动投射物
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );
        
        const speed = this.speed * delta / 1000;
        this.x += Math.cos(angle) * speed;
        this.y += Math.sin(angle) * speed;
        
        // 检查是否击中
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );
        
        if (distance < 20) {
            // 造成伤害
            const isDead = this.target.takeDamage(this.damage);
            if (isDead) {
                this.scene.events.emit('enemy-killed', this.target);
            }
            this.destroy();
            return false;
        }
        
        return true;
    }
}

/**
 * 塔实体类
 */
export class Tower extends Phaser.GameObjects.Image {
    public towerType: TowerType;
    public lastFired: number = 0;
    public rangeCircle?: Phaser.GameObjects.Graphics;
    public level: number = 1;

    constructor(scene: Phaser.Scene, x: number, y: number, towerType: TowerType) {
        super(scene, x, y, towerType.type);
        
        this.towerType = { ...towerType };
        this.level = towerType.level;
        
        // 如果没有纹理，创建一个默认的
        if (!scene.textures.exists(towerType.type)) {
            this.createDefaultTexture();
        }
        
        // 不设置默认缩放，让外部控制
        scene.add.existing(this);
        this.setupInteraction();
    }

    private createDefaultTexture(): void {
        const graphics = this.scene.add.graphics();
        const color = this.getColorByType();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 0, 30);
        graphics.generateTexture(this.towerType.type, 60, 60);
        graphics.destroy();
        this.setTexture(this.towerType.type);
    }

    private getColorByType(): number {
        switch (this.towerType.type) {
            case 'tower-arrow': return 0x8d6e63;
            case 'tower-freeze': return 0x42a5f5;
            case 'tower-laser': return 0xffa726;
            case 'tower-poison': return 0x9c27b0;
            default: return 0x00ff00;
        }
    }

    private setupInteraction(): void {
        this.setInteractive({ useHandCursor: true });
        
        // 移除悬停时的范围显示/隐藏，因为现在默认显示
        this.on('pointerdown', () => {
            this.onTowerClick();
        });
    }

    private showRange(): void {
        // 如果已经有范围圆圈，先清理掉
        if (this.rangeCircle) {
            console.log('已存在范围圆圈，先清理');
            this.hideRange();
        }
        
        console.log(`创建攻击范围圆圈，位置: (${this.x}, ${this.y})，范围: ${this.towerType.range}`);
        
        this.rangeCircle = this.scene.add.graphics();
        this.rangeCircle.lineStyle(2, 0xff6666, 0.5);
        this.rangeCircle.fillStyle(0xff6666, 0.08);
        
        // 攻击范围不受塔的缩放影响，保持原始大小
        this.rangeCircle.strokeCircle(this.x, this.y, this.towerType.range);
        this.rangeCircle.fillCircle(this.x, this.y, this.towerType.range);
        
        // 将范围圆圈添加到塔的父容器中（通常是游戏容器）
        if (this.parentContainer) {
            this.parentContainer.add(this.rangeCircle);
            console.log('范围圆圈已添加到游戏容器');
        } else {
            console.log('警告：没有父容器，范围圆圈可能位置不正确');
        }
    }

    private hideRange(): void {
        if (this.rangeCircle) {
            console.log('隐藏攻击范围圆圈');
            
            // 从父容器中移除
            if (this.parentContainer) {
                this.parentContainer.remove(this.rangeCircle);
                console.log('已从游戏容器中移除范围圆圈');
            }
            
            this.rangeCircle.destroy();
            this.rangeCircle = undefined;
            console.log('范围圆圈已销毁');
        } else {
            console.log('没有需要隐藏的范围圆圈');
        }
    }

    private onTowerClick(): void {
        // 发送塔被点击事件，可以用来升级或显示信息
        this.scene.events.emit('tower-clicked', this);
    }

    public canAttack(currentTime: number): boolean {
        return currentTime - this.lastFired >= (this.towerType.fireRate || 1000);
    }

    public findTarget(enemies: Monster[]): Monster | null {
        let nearestEnemy: Monster | null = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance <= this.towerType.range && distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        return nearestEnemy;
    }

    public attack(target: Monster, currentTime: number): Projectile | null {
        if (!this.canAttack(currentTime)) return null;
        
        this.lastFired = currentTime;
        
        // 创建投射物
        const projectile = new Projectile(
            this.scene, 
            this.x, 
            this.y, 
            target, 
            this.towerType.damage || 10
        );
        
        return projectile;
    }

    public upgrade(): boolean {
        if (this.level >= this.towerType.maxLevel) return false;
        
        this.level++;
        this.towerType.damage = (this.towerType.damage || 10) * 1.2;
        this.towerType.range *= 1.1;
        this.towerType.fireRate = (this.towerType.fireRate || 1000) * 0.9;
        
        // 升级视觉效果
        this.setScale(this.scale * 1.05);
        this.createUpgradeEffect();
        
        return true;
    }

    private createUpgradeEffect(): void {
        // 创建升级特效
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(this.x, this.y, 3, 0xffd700);
            
            // 添加到塔的父容器中
            if (this.parentContainer) {
                this.parentContainer.add(particle);
            }
            
            const angle = (Math.PI * 2 / 8) * i;
            
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 40,
                y: this.y + Math.sin(angle) * 40,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    if (this.parentContainer) {
                        this.parentContainer.remove(particle);
                    }
                    particle.destroy();
                }
            });
        }
    }

    public getUpgradeCost(): number {
        return this.towerType.cost * this.level * 0.5;
    }

    public getInfo(): string {
        return `${this.towerType.name} 等级 ${this.level}\n` +
               `伤害: ${Math.round(this.towerType.damage || 0)}\n` +
               `射程: ${Math.round(this.towerType.range)}\n` +
               `攻速: ${Math.round(1000 / (this.towerType.fireRate || 1000))}/秒`;
    }

    public showRangePermanently(): void {
        // 永久显示攻击范围
        console.log(`${this.towerType.name} 永久显示攻击范围`);
        this.showRange();
    }

    public forceHideRange(): void {
        // 强制隐藏范围，用于清理可能的遗留显示
        this.hideRange();
    }

    public destroy(): void {
        this.hideRange();
        super.destroy();
    }
} 
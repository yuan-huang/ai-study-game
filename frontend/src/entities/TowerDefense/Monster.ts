import { EnemyType } from '@/types/towerDefenseScene';

/**
 * 怪物实体类
 */
export class Monster extends Phaser.GameObjects.Image {
    public enemyType: EnemyType;
    public currentHealth: number;
    public maxHealth: number;
    public pathIndex: number = 0;
    public pathT: number = 0;
    public healthBar?: Phaser.GameObjects.Graphics;
    public healthBarBg?: Phaser.GameObjects.Graphics;
    public path: Phaser.Math.Vector2[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, enemyType: EnemyType, path: Phaser.Math.Vector2[]) {
        super(scene, x, y, enemyType.type);
        
        this.enemyType = enemyType;
        this.currentHealth = enemyType.health;
        this.maxHealth = enemyType.health;
        this.path = path;
        
        // 如果没有纹理，创建一个默认的
        if (!scene.textures.exists(enemyType.type)) {
            this.createDefaultTexture();
        }
        
        this.setScale(0.4);
        scene.add.existing(this);
        
        // 创建血条
        this.createHealthBar();
    }

    private createDefaultTexture(): void {
        const graphics = this.scene.add.graphics();
        const color = this.getColorByType();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(0, 0, 25);
        graphics.generateTexture(this.enemyType.type, 50, 50);
        graphics.destroy();
        this.setTexture(this.enemyType.type);
    }

    private getColorByType(): number {
        switch (this.enemyType.type) {
            case 'monster-normal': return 0xff6b6b;
            case 'monster-gluttonous': return 0xffa502;
            case 'monster-grumpy': return 0x7c4dff;
            case 'monster-lazy': return 0x26de81;
            case 'monster-messy': return 0xfd79a8;
            default: return 0xff6b6b;
        }
    }

    private createHealthBar(): void {
        // 血条背景
        this.healthBarBg = this.scene.add.graphics();
        this.healthBarBg.fillStyle(0x000000, 0.5);
        this.healthBarBg.fillRect(this.x - 20, this.y - 35, 40, 5);
        
        // 血条
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    public updateHealthBar(): void {
        if (!this.healthBar) return;
        
        this.healthBar.clear();
        const healthPercent = this.currentHealth / this.maxHealth;
        const barWidth = 40 * healthPercent;
        
        const color = healthPercent > 0.5 ? 0x00ff00 : 
                     healthPercent > 0.25 ? 0xffff00 : 0xff0000;
        
        this.healthBar.fillStyle(color, 1);
        this.healthBar.fillRect(this.x - 20, this.y - 35, barWidth, 5);
    }

    public update(delta: number, gameSpeed: number = 1): void {
        this.moveAlongPath(delta, gameSpeed);
        this.updateHealthBarPosition();
    }

    private moveAlongPath(delta: number, gameSpeed: number): void {
        if (this.pathIndex >= this.path.length - 1) {
            // 到达终点
            this.onReachEnd();
            return;
        }
        
        const speed = this.enemyType.speed * gameSpeed;
        const distance = speed * delta / 1000;
        
        // 持续移动直到所有距离都被消耗
        let remainingDistance = distance;
        
        while (remainingDistance > 0 && this.pathIndex < this.path.length - 1) {
            const currentPoint = this.path[this.pathIndex];
            const nextPoint = this.path[this.pathIndex + 1];
            
            const segmentLength = Phaser.Math.Distance.Between(
                currentPoint.x, currentPoint.y,
                nextPoint.x, nextPoint.y
            );
            
            // 避免除零错误
            if (segmentLength === 0) {
                this.pathIndex++;
                continue;
            }
            
            const segmentProgress = remainingDistance / segmentLength;
            this.pathT += segmentProgress;
            
            if (this.pathT >= 1) {
                // 移动到下一段，保留超出的部分
                const overflow = this.pathT - 1;
                remainingDistance = overflow * segmentLength;
                this.pathT = 0;
                this.pathIndex++;
                
                // 检查是否到达终点
                if (this.pathIndex >= this.path.length - 1) {
                    this.onReachEnd();
                    return;
                }
            } else {
                // 在当前段内，消耗完所有距离
                remainingDistance = 0;
            }
        }
        
        // 确保pathT在有效范围内
        this.pathT = Math.max(0, Math.min(1, this.pathT));
        
        // 插值计算位置
        if (this.pathIndex < this.path.length - 1) {
            const currentPoint = this.path[this.pathIndex];
            const nextPoint = this.path[this.pathIndex + 1];
            
            const x = Phaser.Math.Linear(currentPoint.x, nextPoint.x, this.pathT);
            const y = Phaser.Math.Linear(currentPoint.y, nextPoint.y, this.pathT);
            
            this.setPosition(x, y);
        }
    }

    private updateHealthBarPosition(): void {
        if (this.healthBarBg) {
            this.healthBarBg.clear();
            this.healthBarBg.fillStyle(0x000000, 0.5);
            this.healthBarBg.fillRect(this.x - 20, this.y - 35, 40, 5);
        }
        
        this.updateHealthBar();
    }

    public takeDamage(damage: number): boolean {
        this.currentHealth -= damage;
        this.updateHealthBar();
        
        // 创建伤害数字
        this.showDamageText(damage);
        
        return this.currentHealth <= 0;
    }

    private showDamageText(damage: number): void {
        const damageText = this.scene.add.text(this.x, this.y - 20, `-${damage}`, {
            fontSize: '20px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                damageText.destroy();
            }
        });
    }

    private onReachEnd(): void {
        // 到达终点时的处理，由场景处理
        this.scene.events.emit('enemy-reached-end', this);
    }

    public destroy(): void {
        this.healthBar?.destroy();
        this.healthBarBg?.destroy();



        super.destroy();
    }
} 
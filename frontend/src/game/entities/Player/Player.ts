import { Scene, GameObjects, Physics } from 'phaser';

export interface PlayerStats {
    health: number;
    maxHealth: number;
    speed: number;
    level: number;
    experience: number;
}

export class Player extends Physics.Arcade.Sprite {
    private stats: PlayerStats;
    private isDead: boolean = false;
    private isInvulnerable: boolean = false;
    private invulnerabilityTimer: number = 0;
    private readonly INVULNERABILITY_DURATION: number = 1000; // 1秒无敌时间

    constructor(scene: Scene, x: number, y: number, texture: string, stats: Partial<PlayerStats> = {}) {
        super(scene, x, y, texture);

        // 初始化属性
        this.stats = {
            health: stats.health ?? 100,
            maxHealth: stats.maxHealth ?? 100,
            speed: stats.speed ?? 200,
            level: stats.level ?? 1,
            experience: stats.experience ?? 0
        };

        // 设置物理属性
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        
        // 设置碰撞体积
        if (this.body) {
            this.body.setSize(48, 48);
            this.body.setOffset(8, 16);
        }

        // 添加到场景
        scene.add.existing(this);
    }

    public update(time: number, delta: number): void {
        if (this.isDead) return;

        // 更新无敌时间
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                this.alpha = 1;
            }
        }
    }

    public takeDamage(amount: number): void {
        if (this.isDead || this.isInvulnerable) return;

        this.stats.health = Math.max(0, this.stats.health - amount);
        
        // 触发受伤效果
        this.setInvulnerable();
        this.scene.cameras.main.shake(100, 0.01);

        // 检查是否死亡
        if (this.stats.health <= 0) {
            this.die();
        }

        // 发出受伤事件
        this.scene.events.emit('playerDamaged', this.stats.health);
    }

    public heal(amount: number): void {
        if (this.isDead) return;
        
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
        this.scene.events.emit('playerHealed', this.stats.health);
    }

    public gainExperience(amount: number): void {
        this.stats.experience += amount;
        // 这里可以添加升级逻辑
        this.scene.events.emit('experienceGained', this.stats.experience);
    }

    private setInvulnerable(): void {
        this.isInvulnerable = true;
        this.invulnerabilityTimer = this.INVULNERABILITY_DURATION;
        this.alpha = 0.5;
    }

    private die(): void {
        this.isDead = true;
        if (this.body) {
            this.setVelocity(0, 0);
        }
        this.setActive(false);
        this.scene.events.emit('playerDied');
    }

    // Getters
    public getStats(): PlayerStats {
        return { ...this.stats };
    }

    public getHealth(): number {
        return this.stats.health;
    }

    public getMaxHealth(): number {
        return this.stats.maxHealth;
    }

    public getSpeed(): number {
        return this.stats.speed;
    }

    public getLevel(): number {
        return this.stats.level;
    }

    public getExperience(): number {
        return this.stats.experience;
    }

    public isDying(): boolean {
        return this.isDead;
    }
} 
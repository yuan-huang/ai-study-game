import { Projectile } from '@/entities/TowerDefense/Tower';

export class ProjectileManager {
    private scene: Phaser.Scene;
    private gameContainer: Phaser.GameObjects.Container;
    private projectiles: Projectile[] = [];

    constructor(scene: Phaser.Scene, gameContainer: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.gameContainer = gameContainer;
    }

    public addProjectile(projectile: Projectile): void {
        this.gameContainer.add(projectile);
        this.projectiles.push(projectile);
    }

    public update(delta: number): void {
        // 更新投射物，并移除已经失效的
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (!projectile.update(delta)) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    public getProjectiles(): Projectile[] {
        return this.projectiles;
    }

    public removeProjectile(projectile: Projectile): void {
        const index = this.projectiles.indexOf(projectile);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
        projectile.destroy();
    }

    public destroy(): void {
        this.projectiles.forEach(projectile => projectile.destroy());
        this.projectiles = [];
    }
} 
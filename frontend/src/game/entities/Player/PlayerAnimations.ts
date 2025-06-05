import { Scene } from 'phaser';
import { Player } from './Player';

export class PlayerAnimations {
    private scene: Scene;
    private player: Player;

    constructor(scene: Scene, player: Player) {
        this.scene = scene;
        this.player = player;
        this.createAnimations();
    }

    private createAnimations(): void {
        // 创建待机动画
        this.scene.anims.create({
            key: 'player-idle',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // 创建行走动画
        this.scene.anims.create({
            key: 'player-walk',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        // 创建跑步动画
        this.scene.anims.create({
            key: 'player-run',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 15,
            repeat: -1
        });

        // 创建跳跃动画
        this.scene.anims.create({
            key: 'player-jump',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 12,
            repeat: 0
        });

        // 创建受伤动画
        this.scene.anims.create({
            key: 'player-hurt',
            frames: this.scene.anims.generateFrameNumbers('player', { start: 16, end: 19 }),
            frameRate: 12,
            repeat: 0
        });
    }

    public playAnimation(key: string, ignoreIfPlaying: boolean = true): void {
        if (ignoreIfPlaying && this.player.anims.isPlaying && this.player.anims.currentAnim?.key === key) {
            return;
        }
        this.player.play(key);
    }

    public updateAnimationState(velocityX: number, velocityY: number, isRunning: boolean): void {
        const isMoving = velocityX !== 0 || velocityY !== 0;

        if (!isMoving) {
            this.playAnimation('player-idle');
        } else if (isRunning) {
            this.playAnimation('player-run');
        } else {
            this.playAnimation('player-walk');
        }
    }

    public playHurt(): void {
        this.playAnimation('player-hurt', false);
        this.player.once('animationcomplete', () => {
            this.playAnimation('player-idle');
        });
    }

    public playJump(): void {
        this.playAnimation('player-jump', false);
        this.player.once('animationcomplete', () => {
            this.playAnimation('player-idle');
        });
    }
} 
import { BaseScene } from './BaseScene';
import { Player } from '../entities/Player/Player';
import { PlayerController } from '../entities/Player/PlayerController';
import { PlayerAnimations } from '../entities/Player/PlayerAnimations';

export class GamePlayScene extends BaseScene {
    private player!: Player;
    private playerController!: PlayerController;
    private playerAnimations!: PlayerAnimations;
    private shiftKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super('GamePlayScene');
    }

    create(): void {
        super.create();

        // 创建背景
        this.createBackground('background');

        // 创建玩家
        this.player = new Player(this, 
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'player'
        );

        // 创建玩家控制器
        this.playerController = new PlayerController(this, this.player);

        // 创建玩家动画
        this.playerAnimations = new PlayerAnimations(this, this.player);

        // 设置相机跟随
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.2);

        // 添加事件监听
        this.events.on('playerDamaged', this.onPlayerDamaged, this);
        this.events.on('playerHealed', this.onPlayerHealed, this);
        this.events.on('playerDied', this.onPlayerDied, this);

        // 初始化按键
        if (this.input.keyboard) {
            this.shiftKey = this.input.keyboard.addKey('SHIFT');
        }
    }

    update(time: number, delta: number): void {
        super.update(time, delta);

        // 更新玩家控制器
        this.playerController.update();

        // 更新玩家动画
        const isRunning = this.shiftKey?.isDown ?? false;
        if (this.player.body) {
            this.playerAnimations.updateAnimationState(
                this.player.body.velocity.x,
                this.player.body.velocity.y,
                isRunning
            );
        }
    }

    private onPlayerDamaged(health: number): void {
        // 播放受伤动画
        this.playerAnimations.playHurt();
        
        // 添加受伤效果
        this.cameras.main.shake(100, 0.01);
        
        // 更新UI
        this.events.emit('updateHealth', health);
    }

    private onPlayerHealed(health: number): void {
        // 添加治疗效果
        this.add.particles(this.player.x, this.player.y, 'heal-particle', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000
        });
        
        // 更新UI
        this.events.emit('updateHealth', health);
    }

    private onPlayerDied(): void {
        // 游戏结束效果
        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.player.getExperience() });
        });
    }

    public destroy(): void {
        // 清理事件监听
        this.events.off('playerDamaged', this.onPlayerDamaged, this);
        this.events.off('playerHealed', this.onPlayerHealed, this);
        this.events.off('playerDied', this.onPlayerDied, this);

        // 清理控制器
        this.playerController.destroy();
    }
} 
import { Scene } from 'phaser';
import { Player } from './Player';

export class PlayerController {
    private player: Player;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys: { [key: string]: Phaser.Input.Keyboard.Key };

    constructor(scene: Scene, player: Player) {
        this.player = player;
        
        // 获取光标键
        const keyboard = scene.input.keyboard;
        if (!keyboard) {
            throw new Error('键盘输入未初始化');
        }
        
        this.cursors = keyboard.createCursorKeys();
        
        // 创建其他按键
        this.keys = {
            w: keyboard.addKey('W'),
            a: keyboard.addKey('A'),
            s: keyboard.addKey('S'),
            d: keyboard.addKey('D'),
            space: keyboard.addKey('SPACE'),
            shift: keyboard.addKey('SHIFT')
        };
    }

    public update(): void {
        if (this.player.isDying()) return;

        // 获取玩家速度
        const speed = this.player.getSpeed();
        let velocityX = 0;
        let velocityY = 0;

        // 处理水平移动
        if (this.cursors.left.isDown || this.keys.a.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            velocityX = speed;
        }

        // 处理垂直移动
        if (this.cursors.up.isDown || this.keys.w.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.keys.s.isDown) {
            velocityY = speed;
        }

        // 对角线移动时进行标准化
        if (velocityX !== 0 && velocityY !== 0) {
            const normalizedVelocity = this.normalizeVelocity(velocityX, velocityY);
            velocityX = normalizedVelocity.x;
            velocityY = normalizedVelocity.y;
        }

        // 设置玩家速度
        this.player.setVelocity(velocityX, velocityY);

        // 更新玩家朝向
        this.updatePlayerFacing(velocityX);
    }

    private normalizeVelocity(x: number, y: number): { x: number; y: number } {
        const length = Math.sqrt(x * x + y * y);
        return {
            x: (x / length) * this.player.getSpeed(),
            y: (y / length) * this.player.getSpeed()
        };
    }

    private updatePlayerFacing(velocityX: number): void {
        if (velocityX < 0) {
            this.player.setFlipX(true);
        } else if (velocityX > 0) {
            this.player.setFlipX(false);
        }
    }

    public destroy(): void {
        // 清理按键绑定
        Object.values(this.keys).forEach(key => key.destroy());
    }
} 
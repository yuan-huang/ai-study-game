import { BaseScene } from './BaseScene';

export class MainMenuScene extends BaseScene {
    constructor() {
        super('MainMenuScene');
    }

    create(): void {
        super.create();

        // 创建背景
        this.createBackground('background');

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // 创建标题
        const title = this.add.text(centerX, centerY - 100, '知识花园', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);

        // 创建菜单按钮
        const startButton = this.addButton(
            centerX,
            centerY + 50,
            '开始游戏',
            () => this.scene.start('GamePlayScene')
        );
        startButton.setOrigin(0.5);

        const settingsButton = this.addButton(
            centerX,
            centerY + 120,
            '设置',
            () => this.scene.start('SettingsScene')
        );
        settingsButton.setOrigin(0.5);

        // 添加版本信息
        const version = this.add.text(10, this.cameras.main.height - 30, 'v1.0.0', {
            fontSize: '16px',
            color: '#ffffff'
        });

        // 添加动画效果
        this.tweens.add({
            targets: title,
            y: centerY - 120,
            duration: 1000,
            ease: 'Bounce',
            repeat: 0
        });

        // 添加背景音乐
        if (this.sound.get('bgm') === null) {
            this.sound.play('bgm', { loop: true, volume: 0.5 });
        }
    }
} 
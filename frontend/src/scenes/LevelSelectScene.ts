import { getAssetPath } from '@/config/AssetConfig';
import { getLevelConfig, LevelType } from '@/config/GameConfig';
import { BaseScene } from './BaseScene';

export class LevelSelectScene extends BaseScene {
    private subject: string = '';
    private subjectName: string = '';

    constructor() {
        super('LevelSelectScene');
    }

    init(data: { subject: string }) {
        this.subject = data.subject;
        // 根据学科键值设置学科名称
        this.subjectName = this.getSubjectName(data.subject);
    }

    preload() {
        //添加背景
        this.load.image('level-select-bg', getAssetPath('level-select-bg'));
        // 打印出学科关卡
        console.log(`进入学科: ${this.subjectName}`);
    }

    create() {
        // 添加背景
        const bg = this.add.image(0, 0, 'level-select-bg')
            .setOrigin(0, 0);

        // 添加学科标题
        this.add.text(
            this.cameras.main.width / 2,
            80,
            `${this.subjectName} - 关卡选择`,
            {
                fontSize: '36px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 20, y: 10 },
                fontFamily: 'Arial, sans-serif'
            }
        ).setOrigin(0.5, 0.5);

        // 添加返回按钮
        this.createBackButton();

        // 创建关卡选择界面
        this.createLevelButtons();
    }

    createBackButton() {
        const backButton = this.add.text(50, 50, '返回', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 }
        });

        backButton.setInteractive({ cursor: 'pointer' });
        backButton.on('pointerdown', () => {
            this.scene.start('MainScene');
        });
    }

    createLevelButtons() {
        // 创建示例关卡按钮
        const levels = [1, 2, 3, 4, 5, 6];
        const startX = this.cameras.main.width / 2 - 250;
        const startY = 200;
        const buttonWidth = 150;
        const buttonHeight = 100;
        const spacing = 20;

        levels.forEach((level, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const x = startX + col * (buttonWidth + spacing);
            const y = startY + row * (buttonHeight + spacing);

            // 创建关卡按钮背景
            const levelBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x4a90e2, 0.8);
            levelBg.setInteractive({ cursor: 'pointer' });

            // 创建关卡数字
            const levelText = this.add.text(x, y, `关卡 ${level}`, {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5, 0.5);

            // 添加悬停效果
            levelBg.on('pointerover', () => {
                levelBg.setFillStyle(0x357abd, 1);
                this.tweens.add({
                    targets: [levelBg, levelText],
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            levelBg.on('pointerout', () => {
                levelBg.setFillStyle(0x4a90e2, 0.8);
                this.tweens.add({
                    targets: [levelBg, levelText],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            // 添加点击事件
            levelBg.on('pointerdown', () => {
                console.log(`点击了${this.subjectName}关卡${level}`);
                // 这里可以跳转到具体的游戏关卡
                // this.scene.start('GameScene', { subject: this.subject, level: level });
            });
        });
    }

    private getSubjectName(subject: string): string {
        const subjectMap: { [key: string]: string } = {
            'chinese': '语文塔',
            'math': '数学塔',
            'english': '英语塔',
            'curious': '好奇树',
            'knowledge': '知识花园'
        };
        return subjectMap[subject] || '未知学科';
    }
} 
import { Scene } from 'phaser';
import { getAssetPath } from '../config/AssetConfig';
import { getLevelConfig, LevelType } from '../config/GameConfig';

export class LevelSelectScene extends Scene {
    private subject: string = '';

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    init(data: { subject: string }) {
        this.subject = data.subject;
    }

    preload() {
        // 加载关卡地图背景
        this.load.image('level-map-bg', getAssetPath('level-map-bg'));
        
        // 加载关卡节点图片
        this.load.image('level-node', getAssetPath('level-node'));
        this.load.image('level-node-completed', getAssetPath('level-node-completed'));
        this.load.image('level-node-locked', getAssetPath('level-node-locked'));
        
        // 加载连接线
        this.load.image('level-line', getAssetPath('level-line'));
    }

    create() {
        // 添加地图背景
        const bg = this.add.image(0, 0, 'level-map-bg')
            .setOrigin(0, 0);
            
        // 自动调整背景图大小以适应屏幕
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);

        // 添加返回按钮
        const backButton = this.add.text(50, 50, '返回', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 }
        }).setInteractive();

        backButton.on('pointerup', () => {
            this.scene.start('MainScene');
        });

        // 添加标题
        let subjectTitle = '';
        switch (this.subject) {
            case 'chinese':
                subjectTitle = '语文知识地图';
                break;
            case 'math':
                subjectTitle = '数学知识地图';
                break;
            case 'english':
                subjectTitle = '英语知识地图';
                break;
        }

        this.add.text(this.cameras.main.width / 2, 80, subjectTitle, {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 创建关卡节点
        this.createLevelNodes();
    }

    private createLevelNodes() {
        // 定义关卡数据
        const levels = this.getLevelData();
        
        // 创建关卡节点
        levels.forEach((level, index) => {
            // 创建连接线（除了第一个节点）
            if (index > 0) {
                const prevLevel = levels[index - 1];
                const line = this.add.line(
                    0, 0,
                    prevLevel.x, prevLevel.y,
                    level.x, level.y,
                    0xffffff
                ).setLineWidth(3);
            }

            // 创建关卡节点
            const node = this.add.image(level.x, level.y, 
                level.status === 'locked' ? 'level-node-locked' :
                level.status === 'completed' ? 'level-node-completed' : 
                'level-node'
            ).setInteractive();

            // 添加关卡文本
            this.add.text(level.x, level.y + 40, level.title, {
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);

            // 添加点击事件
            if (level.status !== 'locked') {
                node.on('pointerup', () => {
                    const levelConfig = getLevelConfig(level.id, this.subject);
                    if (levelConfig) {
                        this.startLevel(levelConfig);
                    }
                });

                // 添加悬停效果
                node.on('pointerover', () => {
                    node.setScale(1.2);
                    // 添加发光效果
                    const pipeline = node.postFX.addPostPipeline('Glow');
                    (pipeline as any).setGlowColor(0xffff00); // 黄色发光
                    (pipeline as any).setIntensity(0.5);      // 发光强度
                    (pipeline as any).setSpeed(3);            // 发光动画速度
                });

                node.on('pointerout', () => {
                    node.setScale(1);
                    // 移除发光效果
                    node.postFX.clear();
                });
            }
        });
    }

    private startLevel(levelConfig: any) {
        // 根据关卡类型跳转到不同的场景
        switch (levelConfig.type) {
            case LevelType.TOWER_DEFENSE:
                this.scene.start('TowerDefenseScene', { levelConfig });
                break;
            case LevelType.IMAGE_QUIZ:
                this.scene.start('ImageQuizScene', { levelConfig });
                break;
            case LevelType.WORD_DRAG:
                this.scene.start('WordDragScene', { levelConfig });
                break;
            case LevelType.WORD_MATCH:
                this.scene.start('WordMatchScene', { levelConfig });
                break;
            case LevelType.DIALOGUE:
                this.scene.start('DialogueScene', { levelConfig });
                break;
            default:
                console.warn('Unknown level type:', levelConfig.type);
        }
    }

    private getLevelData() {
        // 这里返回关卡数据，可以根据不同学科返回不同的关卡配置
        const baseY = 200;
        const ySpacing = 100;
        
        switch (this.subject) {
            case 'chinese':
                return [
                    { id: 1, x: 200, y: baseY, title: '拼音', status: 'completed' },
                    { id: 2, x: 400, y: baseY + ySpacing, title: '词语', status: 'active' },
                    { id: 3, x: 600, y: baseY, title: '句子', status: 'locked' },
                    { id: 4, x: 800, y: baseY + ySpacing, title: '段落', status: 'locked' }
                ];
            case 'math':
                return [
                    { id: 1, x: 200, y: baseY, title: '加法', status: 'completed' },
                    { id: 2, x: 400, y: baseY + ySpacing, title: '减法', status: 'active' },
                    { id: 3, x: 600, y: baseY, title: '乘法', status: 'locked' },
                    { id: 4, x: 800, y: baseY + ySpacing, title: '除法', status: 'locked' }
                ];
            case 'english':
                return [
                    { id: 1, x: 200, y: baseY, title: '字母', status: 'completed' },
                    { id: 2, x: 400, y: baseY + ySpacing, title: '单词', status: 'active' },
                    { id: 3, x: 600, y: baseY, title: '句型', status: 'locked' },
                    { id: 4, x: 800, y: baseY + ySpacing, title: '对话', status: 'locked' }
                ];
            default:
                return [];
        }
    }
} 
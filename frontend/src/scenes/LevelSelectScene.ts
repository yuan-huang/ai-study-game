import { getAssetPath } from '@/config/AssetConfig';
import { getLevelConfig, LevelType } from '@/config/GameConfig';
import { BaseScene } from './BaseScene';
import { levelApi, LevelData, SubjectCode } from '@/api/levelApi';

export class LevelSelectScene extends BaseScene {
    private subject: string = '';
    private subjectName: string = '';
    private grade: number = 4; // 默认4年级
    private levelData: LevelData[] = [];

    constructor() {
        super('LevelSelectScene');
    }

    init(data: { subject: string; grade?: number }) {
        this.subject = data.subject;
        this.grade = data.grade || 4;
        // 打印出学科和年级
        console.log(`进入学科: `,data);

        // 根据学科键值设置学科名称
        this.subjectName = levelApi.getSubjectName(data.subject as SubjectCode);
    }

    preload() {
        //添加背景
        this.load.image('level-select-bg', getAssetPath('level-select-bg'));
        // 打印出学科关卡
        console.log(`进入学科: ${this.subjectName}`);

        // 加载关卡背景音乐
        this.load.audio('level-background-music', getAssetPath('level-background-music'));
    }

    async create() {
        super.create();
        // 添加背景
        const bg = this.add.image(0, 0, 'level-select-bg')
            .setOrigin(0, 0);

        // 添加学科标题
        this.add.text(
            this.cameras.main.width / 2,
            80,
            `${this.subjectName} - ${this.grade}年级 - 关卡选择`,
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

        // 显示加载提示
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            '正在加载关卡数据...',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 20, y: 10 },
                fontFamily: 'Arial, sans-serif'
            }
        ).setOrigin(0.5, 0.5);

        // 异步加载关卡数据
        await this.loadLevelData();
        
        // 移除加载提示
        loadingText.destroy();

        // 对关卡数据进行排序
        this.levelData = levelApi.sortLevels(this.levelData);

        // 创建关卡选择界面
        this.createLevelButtons();

        // 播放关卡背景音乐
        this.audioManager.playMusic(this, 'level-background-music', {
            loop: true
        });
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

    /**
     * 加载关卡数据
     */
    async loadLevelData() {
        try {
            // 类型转换为SubjectCode
            const subjectCode = this.subject as SubjectCode;
            const response = await levelApi.getLevels(subjectCode, this.grade);
            if (response.success && response.data) {
                this.levelData = response.data.categories;
                console.log(`成功加载${this.subjectName}关卡数据:`, this.levelData);
            } else {
                console.error('加载关卡数据失败:', response.message);
                this.levelData = []; // 使用空数据
            }
        } catch (error) {
            console.error('加载关卡数据异常:', error);
            this.levelData = []; // 使用空数据
        }
    }

    createLevelButtons() {
        if (this.levelData.length === 0) {
            // 显示无数据提示
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                '暂无关卡数据',
                {
                    fontSize: '24px',
                    color: '#ffffff',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: { x: 20, y: 10 },
                    fontFamily: 'Arial, sans-serif'
                }
            ).setOrigin(0.5, 0.5);
            return;
        }

        const startX = this.cameras.main.width / 2 - 300;
        const startY = 180;
        const buttonWidth = 180;
        const buttonHeight = 120;
        const spacing = 20;
        const itemsPerRow = 3;

        this.levelData.forEach((levelData, index) => {
            const col = index % itemsPerRow;
            const row = Math.floor(index / itemsPerRow);
            const x = startX + col * (buttonWidth + spacing);
            const y = startY + row * (buttonHeight + spacing);

            // 使用关卡API提供的格式化方法
            const displayInfo = levelApi.formatLevelDisplay(levelData);
            const color = displayInfo.color;

            // 创建关卡按钮背景
            const levelBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, color, 0.8);
            levelBg.setInteractive({ cursor: 'pointer' });

            // 创建关卡标题
            const categoryText = this.add.text(x, y - 15, displayInfo.title, {
                fontSize: '22px',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            }).setOrigin(0.5, 0.5);

            // 创建题目数量和难度信息
            const infoText = this.add.text(x, y + 15, displayInfo.info, {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5, 0.5);

            // 添加悬停效果
            levelBg.on('pointerover', () => {
                levelBg.setFillStyle(color, 1);
                this.tweens.add({
                    targets: [levelBg, categoryText, infoText],
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            levelBg.on('pointerout', () => {
                levelBg.setFillStyle(color, 0.8);
                this.tweens.add({
                    targets: [levelBg, categoryText, infoText],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            // 添加点击事件
            levelBg.on('pointerdown', () => {
                console.log(`点击了${this.subjectName} - ${levelData.category}`);
                // 启动塔防游戏
                this.scene.start('TowerDefenseSceneRefactored', { 
                    subject: this.subject, 
                    grade: this.grade,
                    category: levelData.category,
                    userLevel: 1 // 可以从用户数据中获取
                });
            });
        });
    }


} 
import { ImageQuizLevelData } from '@/config/GameConfig';
import { getAssetPath } from '@/config/AssetConfig';
import { BaseScene } from '../BaseScene';

export class ImageQuizScene extends BaseScene {
    private levelConfig!: ImageQuizLevelData;
    private currentQuestion: number = 0;

    constructor() {
        super('ImageQuizScene');
    }

    init(data: { levelConfig: ImageQuizLevelData }) {
        this.levelConfig = data.levelConfig;
    }

    preload() {
        // 加载问题资源
        // TODO: 从后端获取实际的问题资源
        this.load.image('quiz-bg', getAssetPath('quiz-bg'));
        this.load.image('option-bg', getAssetPath('option-bg'));
    }

    create() {
        // 添加背景
        this.add.image(0, 0, 'quiz-bg').setOrigin(0, 0);

        // 添加返回按钮
        this.createBackButton();

        // 添加进度显示
        this.createProgressUI();

        // 加载第一个问题
        this.loadQuestion();
    }

    private createBackButton() {
        const backButton = this.add.text(50, 50, '返回地图', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 }
        }).setInteractive();

        backButton.on('pointerup', () => {
            this.scene.start('LevelSelectScene', { 
                subject: this.levelConfig.subject 
            });
        });
    }

    private createProgressUI() {
        // 添加进度显示
        this.add.text(this.cameras.main.width - 200, 50, 
            `问题: ${this.currentQuestion + 1}/${this.levelConfig.questionCount}`, {
            fontSize: '32px',
            color: '#ffffff'
        });

        // 添加分数显示
        this.add.text(this.cameras.main.width - 200, 100, '分数: 0', {
            fontSize: '32px',
            color: '#ffffff'
        });
    }

    private loadQuestion() {
        // TODO: 从后端加载问题数据
        const mockQuestion = {
            image: 'question-image',
            options: ['选项1', '选项2', '选项3', '选项4'],
            correctAnswer: 0
        };

        // 显示问题图片
        this.add.image(
            this.cameras.main.width / 2,
            200,
            mockQuestion.image
        ).setOrigin(0.5);

        // 创建选项按钮
        this.createOptions(mockQuestion.options);
    }

    private createOptions(options: string[]) {
        const startY = 400;
        const spacing = 80;

        options.forEach((option, index) => {
            const optionButton = this.add.container(
                this.cameras.main.width / 2,
                startY + spacing * index
            );

            // 添加选项背景
            const bg = this.add.image(0, 0, 'option-bg')
                .setInteractive();

            // 添加选项文本
            const text = this.add.text(0, 0, option, {
                fontSize: '24px',
                color: '#000000'
            }).setOrigin(0.5);

            optionButton.add([bg, text]);

            // 添加点击事件
            bg.on('pointerup', () => {
                this.handleAnswer(index);
            });

            // 添加悬停效果
            bg.on('pointerover', () => {
                bg.setScale(1.1);
            });

            bg.on('pointerout', () => {
                bg.setScale(1);
            });
        });
    }

    private handleAnswer(selectedIndex: number) {
        // TODO: 处理答案选择
        // 1. 检查答案是否正确
        // 2. 显示正确/错误反馈
        // 3. 更新分数
        // 4. 加载下一题或完成关卡
    }

    update() {
        // TODO: 更新游戏逻辑
    }
} 
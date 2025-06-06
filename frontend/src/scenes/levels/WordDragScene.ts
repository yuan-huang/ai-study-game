import { Scene } from 'phaser';
import { WordDragLevelData } from '@/config/GameConfig';
import { getAssetPath } from '@/config/AssetConfig';

export class WordDragScene extends Scene {
    private levelConfig!: WordDragLevelData;
    private draggedWord: Phaser.GameObjects.Text | null = null;

    constructor() {
        super({ key: 'WordDragScene' });
    }

    init(data: { levelConfig: WordDragLevelData }) {
        this.levelConfig = data.levelConfig;
    }

    preload() {
        // 加载游戏资源
        this.load.image('word-drag-bg', getAssetPath('word-drag-bg'));
        this.load.image('word-slot', getAssetPath('word-slot'));
        this.load.image('word-bg', getAssetPath('word-bg'));
        
        if (this.levelConfig.hasAudio) {
            this.load.audio('word-sound', getAssetPath('word-sound'));
        }
    }

    create() {
        // 添加背景
        this.add.image(0, 0, 'word-drag-bg').setOrigin(0, 0);

        // 添加返回按钮
        this.createBackButton();

        // 添加进度显示
        this.createProgressUI();

        // 创建拖拽区域
        this.createDragArea();

        // 创建放置区域
        this.createDropZones();
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
        // 添加分数显示
        this.add.text(this.cameras.main.width - 200, 50, '分数: 0', {
            fontSize: '32px',
            color: '#ffffff'
        });

        // 添加剩余单词显示
        this.add.text(this.cameras.main.width - 200, 100, 
            `剩余: ${this.levelConfig.wordCount}`, {
            fontSize: '32px',
            color: '#ffffff'
        });
    }

    private createDragArea() {
        // TODO: 创建可拖拽的单词
        const words = ['Apple', 'Banana', 'Orange', 'Grape'];
        const startY = this.cameras.main.height - 150;
        const spacing = 120;

        words.forEach((word, index) => {
            const wordContainer = this.add.container(
                spacing + index * spacing,
                startY
            );

            // 添加单词背景
            const bg = this.add.image(0, 0, 'word-bg')
                .setInteractive();

            // 添加单词文本
            const text = this.add.text(0, 0, word, {
                fontSize: '24px',
                color: '#000000'
            }).setOrigin(0.5);

            wordContainer.add([bg, text]);

            // 设置拖拽
            this.input.setDraggable(bg);

            // 拖拽开始
            bg.on('dragstart', () => {
                this.draggedWord = text;
                wordContainer.setAlpha(0.5);
            });

            // 拖拽中
            bg.on('drag', (pointer: Phaser.Input.Pointer) => {
                wordContainer.setPosition(pointer.x, pointer.y);
            });

            // 拖拽结束
            bg.on('dragend', () => {
                this.draggedWord = null;
                wordContainer.setAlpha(1);
                // TODO: 检查是否放在正确的位置
            });
        });
    }

    private createDropZones() {
        // TODO: 创建单词放置区域
        const images = ['apple-img', 'banana-img', 'orange-img', 'grape-img'];
        const startY = 200;
        const spacing = 150;

        images.forEach((image, index) => {
            const zone = this.add.image(
                this.cameras.main.width / 2,
                startY + spacing * index,
                image
            ).setInteractive();

            // 创建放置区域
            const dropZone = this.add.zone(
                zone.x + 200,
                zone.y,
                200,  // width
                60    // height
            ).setRectangleDropZone(200, 60);

            // 添加视觉提示
            const graphics = this.add.graphics();
            graphics.lineStyle(2, 0xffff00);

            if (dropZone.input && dropZone.input.hitArea) {
                graphics.strokeRect(
                    dropZone.x - dropZone.input.hitArea.width / 2,
                    dropZone.y - dropZone.input.hitArea.height / 2,
                    dropZone.input.hitArea.width,
                    dropZone.input.hitArea.height
                );
            }

            // 处理放置
            dropZone.on('drop', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
                if (this.draggedWord) {
                    // TODO: 检查答案是否正确
                    this.checkAnswer(this.draggedWord.text, image);
                }
            });
        });
    }

    private checkAnswer(word: string, image: string) {
        // TODO: 检查答案并更新分数
    }

    update() {
        // TODO: 更新游戏逻辑
    }
} 
import { Scene } from 'phaser';
import { getAssetPath } from '../config/AssetConfig';

export class MainScene extends Scene {


    constructor() {
        super({ key: 'MainScene' });
    }
    preload(): void {
        // 加载背景图片
        this.load.image('main-bg', getAssetPath('main-bg'));
        
        // 加载 数学建筑, 语文建筑, 英语建筑
        this.load.image('chinese-building', getAssetPath('chinese-building'));
        this.load.image('math-building', getAssetPath('math-building'));
        this.load.image('english-building', getAssetPath('english-building'));
    }
    create() {
        // 创建背景
        const bg = this.add.image(0, 0, 'main-bg')
            .setOrigin(0, 0);
            
        // 自动调整背景图大小以适应屏幕
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        
        bg.setScale(scale).setScrollFactor(0);
        
        // 如果背景图片缩放后大于屏幕，则居中显示
        if (bg.displayWidth > this.cameras.main.width) {
            bg.setX((this.cameras.main.width - bg.displayWidth) / 2);
        }
        if (bg.displayHeight > this.cameras.main.height) {
            bg.setY((this.cameras.main.height - bg.displayHeight) / 2);
        }

        // 添加建筑
        // 语文建筑放在左侧
        const chineseBuilding = this.add.image(
            this.cameras.main.width * 0.2,
            this.cameras.main.height * 0.5,
            'chinese-building'
        ).setOrigin(0.5, 1).setInteractive();

        // 数学建筑放在中间
        const mathBuilding = this.add.image(
            this.cameras.main.width * 0.45,
            this.cameras.main.height * 0.3,
            'math-building'
        ).setOrigin(0.5, 1).setInteractive();

        // 英语建筑放在右侧
        const englishBuilding = this.add.image(
            this.cameras.main.width * 0.8,
            this.cameras.main.height * 0.6,
            'english-building'
        ).setOrigin(0.5, 1).setInteractive();

        // 设置建筑大小
        const buildingScale = 1;
        chineseBuilding.setScale(buildingScale);
        mathBuilding.setScale(buildingScale);
        englishBuilding.setScale(buildingScale);

        // 添加建筑点击事件
        this.addBuildingInteraction(chineseBuilding, 'chinese', '语文');
        this.addBuildingInteraction(mathBuilding, 'math', '数学');
        this.addBuildingInteraction(englishBuilding, 'english', '英语');
    }

    private addBuildingInteraction(building: Phaser.GameObjects.Image, subject: string, subjectName: string) {
        // 添加悬停效果
        building.on('pointerover', () => {
            building.setScale(1.1);
            this.add.text(building.x, building.y - building.height, subjectName, {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5, 1).setDepth(1).setName(`${subject}-text`);
        });

        building.on('pointerout', () => {
            building.setScale(1);
            this.children.getByName(`${subject}-text`)?.destroy();
        });

        // 添加点击效果
        building.on('pointerup', () => {
            // 切换到关卡选择场景
            this.scene.start('LevelSelectScene', { subject });
        });
    }
} 
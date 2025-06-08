import { getAssetPath } from '@/config/AssetConfig';
import { EffectManager } from '@/effects';
import { BaseScene } from './BaseScene';

export class MainScene extends BaseScene {
    private effectManager!: EffectManager;

    constructor() {
        super('MainScene');
    }
    
    init() {
        // 确保输入管理器正确设置
        if (this.input) {
            this.input.topOnly = true; // 只处理最顶层的交互
        }
        
        // 监听场景切换事件
        this.events.on('shutdown', this.cleanup, this);
        this.events.on('destroy', this.cleanup, this);
    }
    
    preload(): void {
        // 加载背景图片
        this.load.image('main-bg', getAssetPath('main-bg'));
        
        // 加载 数学建筑, 语文建筑, 英语建筑
        this.load.image('chinese-building', getAssetPath('chinese-building'));
        this.load.image('math-building', getAssetPath('math-building'));
        this.load.image('english-building', getAssetPath('english-building'));
        this.load.image('curious-tree', getAssetPath('curious-tree'));
        this.load.image('knowledge-flower', getAssetPath('knowledge-flower'));
        this.load.image('sprite', getAssetPath('sprite'));
        this.load.image('sprite-fly', getAssetPath('sprite-fly'));
        // 加载主城背景音乐
        this.load.audio('main-city-bgm', getAssetPath('main-city-bgm'));
    }
    
    create() {
        // 初始化效果管理器
        this.effectManager = new EffectManager(this);

        // 创建背景
        const bg = this.add.image(0, 0, 'main-bg')
            .setOrigin(0, 0);



        // 添加建筑
        // 语文 右中
        const chineseBuilding = this.add.image(
            this.cameras.main.width * 0.82,
            this.cameras.main.height * 0.42,
            'chinese-building'
        ).setScale(0.4)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            chineseBuilding.x,
            chineseBuilding.y + chineseBuilding.height * 0.2,
            '语文塔',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);



        // 数学 右上
        const mathBuilding = this.add.image(
            this.cameras.main.width * 0.72,
            this.cameras.main.height * 0.24,
            'math-building'
        ).setScale(0.3)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            mathBuilding.x,
            mathBuilding.y + mathBuilding.height * 0.1,
            '数学塔',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);



        // 英语建筑 左边
        const englishBuilding = this.add.image(
            this.cameras.main.width * 0.42,
            this.cameras.main.height * 0.22,
            'english-building'
        ).setScale(0.35)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            englishBuilding.x,
            englishBuilding.y + englishBuilding.height * 0.1,
            '英语塔',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);




        // 好奇树 中间
        const curiousTree = this.add.image(
            this.cameras.main.width * 0.57,
            this.cameras.main.height * 0.25,
            'curious-tree'
        ).setScale(0.5)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            curiousTree.x,
            curiousTree.y + curiousTree.height * 0.2,
            '好奇树',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);





        // 知识花
        const knowledgeFlower = this.add.image(
            this.cameras.main.width * 0.45,
            this.cameras.main.height * 0.65,
            'knowledge-flower'
        ).setScale(0.4)
        .setInteractive({ cursor: 'pointer' });
        
        // 添加永久学科名称标签
        this.createText(
            knowledgeFlower.x,
            knowledgeFlower.y + knowledgeFlower.height * 0.12,
            '知识花园',
            'LABEL_TEXT',
            {
                fontSize: 24,
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: { x: 10, y: 6 }
            }
        ).setOrigin(0.5, 0.5).setDepth(100);

        // 精灵 左下
        const sprite = this.add.image(
            this.cameras.main.width * 0.18,
            this.cameras.main.height * 0.7,
            'sprite-fly'
        ).setScale(0.5)
        .setOrigin(0.5, 0.5)
        .setInteractive({ cursor: 'pointer' });
        sprite.flipX = true;

        // 保存原始缩放值
        chineseBuilding.setData('originalScale', 0.4);
        mathBuilding.setData('originalScale', 0.3);
        englishBuilding.setData('originalScale', 0.35);
        curiousTree.setData('originalScale', 0.5);
        knowledgeFlower.setData('originalScale', 0.4);
        sprite.setData('originalScale', 0.5);

        // 使用效果管理器添加交互效果
        this.effectManager.addBuildingInteraction(chineseBuilding, 'chinese', '语文塔');
        this.effectManager.addBuildingInteraction(mathBuilding, 'math', '数学塔');
        this.effectManager.addBuildingInteraction(englishBuilding, 'english', '英语塔');


        this.effectManager.addCuriousTreeInteraction(curiousTree,'curious','好奇树');
        this.effectManager.addKnowledgeFlowerInteraction(knowledgeFlower,'knowledge','知识花园');
        
        this.effectManager.addSpriteInteraction(sprite);
        


        // 播放主城背景音乐
        this.sound.stopAll();
        this.sound.play('main-city-bgm', {
            loop: true,
            volume: 0.5
        });
    }

    /**
     * 清理场景资源
     */
    private cleanup(): void {
        // 停止主城背景音乐
        this.sound.stopAll();
        
        // 清理效果管理器
        if (this.effectManager) {
            this.effectManager.destroy();
        }
    }
    

} 


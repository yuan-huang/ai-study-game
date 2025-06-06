import { Scene } from 'phaser';
import { getAssetPath } from '@/config/AssetConfig';

export class MainScene extends Scene {


    constructor() {
        super({ key: 'MainScene' });
    }
    
    init() {
        console.log('MainScene: 场景初始化');
        
        // 确保输入管理器正确设置
        if (this.input) {
            this.input.topOnly = true; // 只处理最顶层的交互
            console.log('MainScene: 输入管理器已配置');
        }
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
    }
    create() {
        // 创建背景
        const bg = this.add.image(0, 0, 'main-bg')
            .setOrigin(0, 0);
            
        console.log('MainScene: 开始创建游戏元素');

        // 添加Canvas级别的鼠标事件测试
        this.input.on('pointerover', () => {
            console.log('🖱️ Canvas: 鼠标进入游戏区域');
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            // 每秒最多输出一次，避免控制台刷屏
            if (!this.data.get('lastMoveLog') || Date.now() - this.data.get('lastMoveLog') > 1000) {
                console.log(`🖱️ Canvas: 鼠标移动到 (${Math.round(pointer.x)}, ${Math.round(pointer.y)})`);
                this.data.set('lastMoveLog', Date.now());
            }
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            console.log(`🖱️ Canvas: 鼠标点击 (${Math.round(pointer.x)}, ${Math.round(pointer.y)})`);
        });

        // 测试Canvas DOM元素的鼠标事件
        const canvas = this.sys.game.canvas;
        if (canvas) {
            console.log('🖥️ Canvas DOM元素找到，添加原生事件监听器');
            
            canvas.addEventListener('mouseenter', () => {
                console.log('🖥️ DOM: 鼠标进入Canvas');
            });
            
            canvas.addEventListener('mousemove', (e) => {
                if (!this.data.get('lastDomMoveLog') || Date.now() - this.data.get('lastDomMoveLog') > 1000) {
                    console.log(`🖥️ DOM: 鼠标移动 (${e.offsetX}, ${e.offsetY})`);
                    this.data.set('lastDomMoveLog', Date.now());
                }
            });
            
            canvas.addEventListener('click', (e) => {
                console.log(`🖥️ DOM: 鼠标点击 (${e.offsetX}, ${e.offsetY})`);
            });
        } else {
            console.error('❌ 无法找到Canvas DOM元素');
        }

        // 添加建筑
        // 语文 右中
        const chineseBuilding = this.add.image(
            this.cameras.main.width * 0.82,
            this.cameras.main.height * 0.42,
            'chinese-building'
        ).setScale(0.4)
        .setInteractive({ cursor: 'pointer' });

        // 数学 右上
        const mathBuilding = this.add.image(
            this.cameras.main.width * 0.72,
            this.cameras.main.height * 0.24,
            'math-building'
        ).setScale(0.3)
        .setInteractive({ cursor: 'pointer' });

        // 英语建筑 左边
        const englishBuilding = this.add.image(
            this.cameras.main.width * 0.42,
            this.cameras.main.height * 0.22,
            'english-building'
        ).setScale(0.35)
        .setInteractive({ cursor: 'pointer' });

        // 好奇树 中间
        const curiousTree = this.add.image(
            this.cameras.main.width * 0.57,
            this.cameras.main.height * 0.25,
            'curious-tree'
        ).setScale(0.5)
        .setInteractive({ cursor: 'pointer' });

        // 知识花
        const knowledgeFlower = this.add.image(
            this.cameras.main.width * 0.45,
            this.cameras.main.height * 0.65,
            'knowledge-flower'
        ).setScale(0.4)
        .setInteractive({ cursor: 'pointer' });

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

        console.log('MainScene: 游戏元素创建完成');

        // 添加建筑点击事件
        this.addBuildingInteraction(chineseBuilding, 'chinese', '语文');
        this.addBuildingInteraction(mathBuilding, 'math', '数学');
        this.addBuildingInteraction(englishBuilding, 'english', '英语');
        this.addBuildingInteraction(curiousTree, 'curious', '好奇');
        this.addBuildingInteraction(knowledgeFlower, 'knowledge', '知识');

        // 为精灵添加特殊的悬停效果
        this.addSpriteInteraction(sprite);

        console.log('MainScene: 交互事件绑定完成');
    }

    private addBuildingInteraction(building: Phaser.GameObjects.Image, subject: string, subjectName: string) {
        const originalScale = building.getData('originalScale');
        const hoverScale = originalScale * 1.15;

        console.log(`添加交互事件: ${subjectName} (${subject})`);

        // 添加悬停效果
        building.on('pointerover', () => {
            console.log(`鼠标悬停: ${subjectName}`);
            
            // 设置手型光标
            building.input!.cursor = 'pointer';
            this.input.setDefaultCursor('pointer');
            
            // 平滑缩放动画
            this.tweens.add({
                targets: building,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 200,
                ease: 'Power2'
            });

            // 添加高亮效果（使用tint替代postFX）
            building.setTint(0xffffaa);
            
            // 创建发光边框效果
            const glowEffect = this.add.image(building.x, building.y, building.texture.key)
                .setScale(hoverScale * 1.05)
                .setTint(0xffd700)
                .setAlpha(0.3)
                .setDepth(building.depth - 1)
                .setName(`${subject}-glow`);

            // 发光边框的脉冲动画
            this.tweens.add({
                targets: glowEffect,
                alpha: 0.6,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // 显示名称标签
            const nameText = this.add.text(building.x, building.y - building.height * 0.6, subjectName, {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 12, y: 8 },
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5, 1).setDepth(1000).setName(`${subject}-text`);

            // 标签淡入动画
            nameText.setAlpha(0);
            this.tweens.add({
                targets: nameText,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            });
        });

        building.on('pointerout', () => {
            console.log(`鼠标离开: ${subjectName}`);
            
            // 恢复默认光标
            this.input.setDefaultCursor('default');
            
            // 平滑恢复原始大小
            this.tweens.add({
                targets: building,
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 200,
                ease: 'Power2'
            });

            // 移除高亮效果
            building.clearTint();

            // 移除发光效果
            const glowEffect = this.children.getByName(`${subject}-glow`);
            if (glowEffect) {
                this.tweens.killTweensOf(glowEffect);
                glowEffect.destroy();
            }

            // 移除标签
            const nameText = this.children.getByName(`${subject}-text`);
            if (nameText) {
                this.tweens.add({
                    targets: nameText,
                    alpha: 0,
                    duration: 200,
                    ease: 'Power2',
                    onComplete: () => {
                        nameText.destroy();
                    }
                });
            }
        });

        // 添加点击效果
        building.on('pointerdown', () => {
            console.log(`点击: ${subjectName}`);
            
            // 点击时稍微缩小
            this.tweens.add({
                targets: building,
                scaleX: originalScale * 0.95,
                scaleY: originalScale * 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
        });

        building.on('pointerup', () => {
            console.log(`点击释放: ${subjectName} - 准备切换场景`);
            // 切换到关卡选择场景
            this.scene.start('LevelSelectScene', { subject });
        });
    }

    private addSpriteInteraction(sprite: Phaser.GameObjects.Image) {
        const originalScale = sprite.getData('originalScale');
        const hoverScale = originalScale * 1.2;

        console.log('添加精灵交互事件');

        sprite.on('pointerover', () => {
            console.log('鼠标悬停: 精灵');
            
            // 设置手型光标
            sprite.input!.cursor = 'pointer';
            this.input.setDefaultCursor('pointer');
            
            // 精灵的特殊悬停效果
            this.tweens.add({
                targets: sprite,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 300,
                ease: 'Bounce.easeOut'
            });

            // 精灵彩色高亮效果
            sprite.setTint(0xffaaff);

            // 创建彩色光环效果
            const haloEffect = this.add.image(sprite.x, sprite.y, sprite.texture.key)
                .setScale(hoverScale * 1.1)
                .setTint(0xff69b4)
                .setAlpha(0.4)
                .setDepth(sprite.depth - 1)
                .setFlipX(sprite.flipX)
                .setName('sprite-halo');

            // 光环的旋转和脉冲动画
            this.tweens.add({
                targets: haloEffect,
                rotation: Math.PI * 2,
                alpha: 0.7,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // 轻微的浮动动画
            this.tweens.add({
                targets: sprite,
                y: sprite.y - 10,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        sprite.on('pointerout', () => {
            console.log('鼠标离开: 精灵');
            
            // 恢复默认光标
            this.input.setDefaultCursor('default');
            
            // 恢复原始大小
            this.tweens.add({
                targets: sprite,
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 300,
                ease: 'Power2'
            });

            // 移除高亮效果
            sprite.clearTint();

            // 移除光环效果
            const haloEffect = this.children.getByName('sprite-halo');
            if (haloEffect) {
                this.tweens.killTweensOf(haloEffect);
                haloEffect.destroy();
            }

            // 停止浮动动画并恢复原始位置
            this.tweens.killTweensOf(sprite);
            this.tweens.add({
                targets: sprite,
                y: this.cameras.main.height * 0.7,
                duration: 300,
                ease: 'Power2'
            });
        });

        sprite.on('pointerdown', () => {
            console.log('点击: 精灵');
            
            // 精灵点击效果
            this.tweens.add({
                targets: sprite,
                scaleX: originalScale * 0.9,
                scaleY: originalScale * 0.9,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
        });
    }
} 
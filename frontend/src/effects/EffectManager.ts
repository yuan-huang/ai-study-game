import { GameObjects, Scene } from 'phaser';
import { BuildingEffect } from './BuildingEffect';
import { SpriteEffect } from './SpriteEffect';

export class EffectManager {


    private scene: Scene;
    public buildingEffect: BuildingEffect;
    private spriteEffect: SpriteEffect;

    constructor(scene: Scene) {
        this.scene = scene;
        this.buildingEffect = new BuildingEffect(scene);
        this.spriteEffect = new SpriteEffect(scene);
    }

    /**
     * 为建筑添加交互效果
     */
    addBuildingInteraction(
        building: Phaser.GameObjects.Image,
        subject: string,
        subjectName: string
    ) {
        this.buildingEffect.addBuildingInteraction(building, subject, subjectName);

    }

    /**
     * 为精灵添加交互效果
     */
    addSpriteInteraction(sprite: Phaser.GameObjects.Image) {
        this.spriteEffect.addSpriteInteraction(sprite);

    }

    /**
     * 为好奇树添加交互效果
     */
    addCuriousTreeInteraction(curiousTree: GameObjects.Image, _subject: string, subjectName: string) {
        const originalScale = curiousTree.getData('originalScale') || 1;
        const hoverScale = originalScale * 1.15;

        // 添加悬停效果
        curiousTree.on('pointerover', () => {
            this.showCuriousTreeHoverEffect(curiousTree, hoverScale, subjectName);
        });

        curiousTree.on('pointerout', () => {
            this.hideCuriousTreeHoverEffect(curiousTree, originalScale);
        });

        // 添加点击效果
        curiousTree.on('pointerdown', () => {
            this.showClickEffect(curiousTree, originalScale);
        });

        curiousTree.on('pointerup', () => {
            // 跳转到好奇树场景
            this.scene.scene.start('CuriousTreeScene');
        });
    }

    /**
     * 为知识花园添加交互效果
     */
    addKnowledgeFlowerInteraction(knowledgeFlower: GameObjects.Image, _subject: string, subjectName: string) {
        const originalScale = knowledgeFlower.getData('originalScale') || 1;
        const hoverScale = originalScale * 1.15;

        // 添加悬停效果
        knowledgeFlower.on('pointerover', () => {
            this.showKnowledgeFlowerHoverEffect(knowledgeFlower, hoverScale, subjectName);
        });

        knowledgeFlower.on('pointerout', () => {
            this.hideKnowledgeFlowerHoverEffect(knowledgeFlower, originalScale);
        });

        // 添加点击效果
        knowledgeFlower.on('pointerdown', () => {
            this.showClickEffect(knowledgeFlower, originalScale);
        });

        knowledgeFlower.on('pointerup', () => {
            // 跳转到知识花园场景
            this.scene.scene.start('GardenScene');
        });
    }

    /**
     * 显示好奇树悬停效果
     */
    private showCuriousTreeHoverEffect(
        curiousTree: GameObjects.Image,
        hoverScale: number,
        subjectName: string
    ) {
        // 设置手型光标
        curiousTree.input!.cursor = 'pointer';
        this.scene.input.setDefaultCursor('pointer');
        
        // 平滑缩放动画
        this.scene.tweens.add({
            targets: curiousTree,
            scaleX: hoverScale,
            scaleY: hoverScale,
            duration: 200,
            ease: 'Power2'
        });

        // 添加高亮效果
        curiousTree.setTint(0xaaffaa);
        
        // 创建发光效果
        this.createGlowEffect(curiousTree, 'curious-tree', hoverScale, 0x00ff00);
        
        // 显示名称标签
        this.createNameTag(curiousTree, 'curious-tree', '🌳 ' + subjectName);
    }

    /**
     * 隐藏好奇树悬停效果
     */
    private hideCuriousTreeHoverEffect(curiousTree: GameObjects.Image, originalScale: number) {
        // 恢复默认光标
        this.scene.input.setDefaultCursor('default');
        
        // 平滑恢复原始大小
        this.scene.tweens.add({
            targets: curiousTree,
            scaleX: originalScale,
            scaleY: originalScale,
            duration: 200,
            ease: 'Power2'
        });

        // 移除高亮效果
        curiousTree.clearTint();

        // 移除发光效果和标签
        this.removeGlowEffect('curious-tree');
        this.removeNameTag('curious-tree');
    }

    /**
     * 显示知识花园悬停效果
     */
    private showKnowledgeFlowerHoverEffect(
        knowledgeFlower: GameObjects.Image,
        hoverScale: number,
        subjectName: string
    ) {
        // 设置手型光标
        knowledgeFlower.input!.cursor = 'pointer';
        this.scene.input.setDefaultCursor('pointer');
        
        // 平滑缩放动画
        this.scene.tweens.add({
            targets: knowledgeFlower,
            scaleX: hoverScale,
            scaleY: hoverScale,
            duration: 200,
            ease: 'Power2'
        });

        // 添加高亮效果
        knowledgeFlower.setTint(0xffaaff);
        
        // 创建发光效果
        this.createGlowEffect(knowledgeFlower, 'knowledge-flower', hoverScale, 0xff00ff);
        
        // 显示名称标签
        this.createNameTag(knowledgeFlower, 'knowledge-flower', '🌺 ' + subjectName);
    }

    /**
     * 隐藏知识花园悬停效果
     */
    private hideKnowledgeFlowerHoverEffect(knowledgeFlower: GameObjects.Image, originalScale: number) {
        // 恢复默认光标
        this.scene.input.setDefaultCursor('default');
        
        // 平滑恢复原始大小
        this.scene.tweens.add({
            targets: knowledgeFlower,
            scaleX: originalScale,
            scaleY: originalScale,
            duration: 200,
            ease: 'Power2'
        });

        // 移除高亮效果
        knowledgeFlower.clearTint();

        // 移除发光效果和标签
        this.removeGlowEffect('knowledge-flower');
        this.removeNameTag('knowledge-flower');
    }

    /**
     * 显示点击效果
     */
    private showClickEffect(building: GameObjects.Image, originalScale: number) {
        // 点击时稍微缩小
        this.scene.tweens.add({
            targets: building,
            scaleX: originalScale * 0.95,
            scaleY: originalScale * 0.95,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }

    /**
     * 创建发光效果
     */
    private createGlowEffect(
        building: GameObjects.Image,
        name: string,
        hoverScale: number,
        glowColor: number = 0xffd700
    ) {
        const glowEffect = this.scene.add.image(building.x, building.y, building.texture.key)
            .setScale(hoverScale * 1.05)
            .setTint(glowColor)
            .setAlpha(0.3)
            .setDepth(building.depth - 1)
            .setName(`${name}-glow`);

        // 发光边框的脉冲动画
        this.scene.tweens.add({
            targets: glowEffect,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 移除发光效果
     */
    private removeGlowEffect(name: string) {
        const glowEffect = this.scene.children.getByName(`${name}-glow`);
        if (glowEffect) {
            this.scene.tweens.killTweensOf(glowEffect);
            glowEffect.destroy();
        }
    }

    /**
     * 创建名称标签
     */
    private createNameTag(
        building: GameObjects.Image,
        name: string,
        displayName: string
    ) {
        const nameText = this.scene.add.text(
            building.x, 
            building.y - building.height * 0.6, 
            displayName, 
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 12, y: 8 },
                fontFamily: 'Arial, sans-serif'
            }
        ).setOrigin(0.5, 1).setDepth(1000).setName(`${name}-text`);

        // 标签淡入动画
        nameText.setAlpha(0);
        this.scene.tweens.add({
            targets: nameText,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    /**
     * 移除名称标签
     */
    private removeNameTag(name: string) {
        const nameText = this.scene.children.getByName(`${name}-text`);
        if (nameText) {
            this.scene.tweens.add({
                targets: nameText,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    nameText.destroy();
                }
            });
        }
    }

    /**
     * 销毁效果管理器
     */
    destroy() {
        this.buildingEffect = null as any;
        this.spriteEffect = null as any;
        this.scene = null as any;
    }
} 
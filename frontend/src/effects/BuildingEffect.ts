import { Scene } from 'phaser';

export class BuildingEffect {
    private scene: Scene;
    
    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * 为建筑添加交互效果
     */
    addBuildingInteraction(
        building: Phaser.GameObjects.Image, 
        subject: string, 
        subjectName: string
    ) {
        const originalScale = building.getData('originalScale');
        const hoverScale = originalScale * 1.15;

        // 添加悬停效果
        building.on('pointerover', () => {
            this.showHoverEffect(building, subject, subjectName, hoverScale);
        });

        building.on('pointerout', () => {
            this.hideHoverEffect(building, subject, originalScale);
        });

        // 添加点击效果
        building.on('pointerdown', () => {
            this.showClickEffect(building, originalScale);
        });

        building.on('pointerup', () => {
            this.handleBuildingClick(subject);
        });
    }

    /**
     * 显示悬停效果
     */
    private showHoverEffect(
        building: Phaser.GameObjects.Image,
        subject: string,
        subjectName: string,
        hoverScale: number
    ) {
        // 设置手型光标
        building.input!.cursor = 'pointer';
        this.scene.input.setDefaultCursor('pointer');
        
        // 平滑缩放动画
        this.scene.tweens.add({
            targets: building,
            scaleX: hoverScale,
            scaleY: hoverScale,
            duration: 200,
            ease: 'Power2'
        });

        // 添加高亮效果
        building.setTint(0xffffaa);
        
        // 创建发光边框效果
        this.createGlowEffect(building, subject, hoverScale);
        
        // 显示名称标签
        this.createNameTag(building, subject, subjectName);
    }

    /**
     * 隐藏悬停效果
     */
    private hideHoverEffect(
        building: Phaser.GameObjects.Image,
        subject: string,
        originalScale: number
    ) {
        // 恢复默认光标
        this.scene.input.setDefaultCursor('default');
        
        // 平滑恢复原始大小
        this.scene.tweens.add({
            targets: building,
            scaleX: originalScale,
            scaleY: originalScale,
            duration: 200,
            ease: 'Power2'
        });

        // 移除高亮效果
        building.clearTint();

        // 移除发光效果
        this.removeGlowEffect(subject);

        // 移除标签
        this.removeNameTag(subject);
    }

    /**
     * 显示点击效果
     */
    private showClickEffect(building: Phaser.GameObjects.Image, originalScale: number) {
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
     * 处理建筑点击
     */
    private handleBuildingClick(subject: string) {
        // 切换到关卡选择场景
        this.scene.scene.start('LevelSelectScene', { subject });
    }

    /**
     * 创建发光效果
     */
    private createGlowEffect(
        building: Phaser.GameObjects.Image,
        subject: string,
        hoverScale: number
    ) {
        const glowEffect = this.scene.add.image(building.x, building.y, building.texture.key)
            .setScale(hoverScale * 1.05)
            .setTint(0xffd700)
            .setAlpha(0.3)
            .setDepth(building.depth - 1)
            .setName(`${subject}-glow`);

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
    private removeGlowEffect(subject: string) {
        const glowEffect = this.scene.children.getByName(`${subject}-glow`);
        if (glowEffect) {
            this.scene.tweens.killTweensOf(glowEffect);
            glowEffect.destroy();
        }
    }

    /**
     * 创建名称标签
     */
    private createNameTag(
        building: Phaser.GameObjects.Image,
        subject: string,
        subjectName: string
    ) {
        const nameText = this.scene.add.text(
            building.x, 
            building.y - building.height * 0.6, 
            subjectName, 
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: { x: 12, y: 8 },
                fontFamily: 'Arial, sans-serif'
            }
        ).setOrigin(0.5, 1).setDepth(1000).setName(`${subject}-text`);

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
    private removeNameTag(subject: string) {
        const nameText = this.scene.children.getByName(`${subject}-text`);
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
} 
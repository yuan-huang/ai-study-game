import { Scene } from 'phaser';

export class SpriteEffect {
    private scene: Scene;
    
    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * 为精灵添加交互效果
     */
    addSpriteInteraction(sprite: Phaser.GameObjects.Image) {
        const originalScale = sprite.getData('originalScale');
        const hoverScale = originalScale * 1.2;
        const originalY = this.scene.cameras.main.height * 0.7;

        sprite.on('pointerover', () => {
            this.showHoverEffect(sprite, hoverScale, originalY);
        });

        sprite.on('pointerout', () => {
            this.hideHoverEffect(sprite, originalScale, originalY);
        });

        sprite.on('pointerdown', () => {
            this.showClickEffect(sprite, originalScale);
        });
    }

    /**
     * 显示悬停效果
     */
    private showHoverEffect(
        sprite: Phaser.GameObjects.Image,
        hoverScale: number,
        originalY: number
    ) {
        // 设置手型光标
        sprite.input!.cursor = 'pointer';
        this.scene.input.setDefaultCursor('pointer');
        
        // 精灵的特殊悬停效果
        this.scene.tweens.add({
            targets: sprite,
            scaleX: hoverScale,
            scaleY: hoverScale,
            duration: 300,
            ease: 'Bounce.easeOut'
        });

        // 精灵彩色高亮效果
        sprite.setTint(0xffaaff);

        // 创建彩色光环效果
        this.createHaloEffect(sprite, hoverScale);

        // 轻微的浮动动画
        this.startFloatingAnimation(sprite, originalY);
    }

    /**
     * 隐藏悬停效果
     */
    private hideHoverEffect(
        sprite: Phaser.GameObjects.Image,
        originalScale: number,
        originalY: number
    ) {
        // 恢复默认光标
        this.scene.input.setDefaultCursor('default');
        
        // 恢复原始大小
        this.scene.tweens.add({
            targets: sprite,
            scaleX: originalScale,
            scaleY: originalScale,
            duration: 300,
            ease: 'Power2'
        });

        // 移除高亮效果
        sprite.clearTint();

        // 移除光环效果
        this.removeHaloEffect();

        // 停止浮动动画并恢复原始位置
        this.stopFloatingAnimation(sprite, originalY);
    }

    /**
     * 显示点击效果
     */
    private showClickEffect(sprite: Phaser.GameObjects.Image, originalScale: number) {
        // 精灵点击效果
        this.scene.tweens.add({
            targets: sprite,
            scaleX: originalScale * 0.9,
            scaleY: originalScale * 0.9,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }

    /**
     * 创建光环效果
     */
    private createHaloEffect(sprite: Phaser.GameObjects.Image, hoverScale: number) {
        const haloEffect = this.scene.add.image(sprite.x, sprite.y, sprite.texture.key)
            .setScale(hoverScale * 1.1)
            .setTint(0xff69b4)
            .setAlpha(0.4)
            .setDepth(sprite.depth - 1)
            .setFlipX(sprite.flipX)
            .setName('sprite-halo');

        // 光环的旋转和脉冲动画
        this.scene.tweens.add({
            targets: haloEffect,
            rotation: Math.PI * 2,
            alpha: 0.7,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 移除光环效果
     */
    private removeHaloEffect() {
        const haloEffect = this.scene.children.getByName('sprite-halo');
        if (haloEffect) {
            this.scene.tweens.killTweensOf(haloEffect);
            haloEffect.destroy();
        }
    }

    /**
     * 开始浮动动画
     */
    private startFloatingAnimation(sprite: Phaser.GameObjects.Image, originalY: number) {
        this.scene.tweens.add({
            targets: sprite,
            y: originalY - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 停止浮动动画
     */
    private stopFloatingAnimation(sprite: Phaser.GameObjects.Image, originalY: number) {
        this.scene.tweens.killTweensOf(sprite);
        this.scene.tweens.add({
            targets: sprite,
            y: originalY,
            duration: 300,
            ease: 'Power2'
        });
    }
} 
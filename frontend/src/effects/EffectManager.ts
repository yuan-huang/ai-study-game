import { Scene } from 'phaser';
import { BuildingEffect } from './BuildingEffect';
import { SpriteEffect } from './SpriteEffect';

export class EffectManager {
    private scene: Scene;
    private buildingEffect: BuildingEffect;
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
     * 销毁效果管理器
     */
    destroy() {
        this.buildingEffect = null as any;
        this.spriteEffect = null as any;
        this.scene = null as any;
    }
} 
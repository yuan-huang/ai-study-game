import { Scene } from 'phaser';
import { getAssetPath } from '@/config/AssetConfig';
import { getLevelConfig, LevelType } from '@/config/GameConfig';

export class LevelSelectScene extends Scene {
    private subject: string = '';

    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    init(data: { subject: string }) {
        this.subject = data.subject;
    }

    preload() {

    }

    create() {
   
    }

 
} 
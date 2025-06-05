import Phaser from 'phaser';
import { GlowPipeline } from './effects/GlowPipeline';

export class Game extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
        
        // 注册自定义管线
        if (this.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
            this.renderer.pipelines.addPostPipeline('Glow', GlowPipeline);
        }
    }
} 
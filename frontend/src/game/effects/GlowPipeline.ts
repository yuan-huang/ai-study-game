import Phaser from 'phaser';

const fragShader = `
#define SHADER_NAME GLOW_FS

precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uResolution;
uniform float uIntensity;
uniform vec3 uGlowColor;

varying vec2 outTexCoord;

void main() {
    vec4 texture = texture2D(uMainSampler, outTexCoord);
    vec4 glow = vec4(0.0);
    
    // 创建发光效果
    float intensity = uIntensity * (0.7 + 0.3 * sin(uTime * uSpeed));
    
    // 采样周围的像素
    float dx = 2.0 / uResolution.x;
    float dy = 2.0 / uResolution.y;
    
    // 发光扩散
    for(float x = -2.0; x <= 2.0; x += 1.0) {
        for(float y = -2.0; y <= 2.0; y += 1.0) {
            vec2 offset = vec2(dx * x, dy * y);
            glow += texture2D(uMainSampler, outTexCoord + offset);
        }
    }
    
    glow /= 25.0; // 平均化发光
    
    // 混合原始纹理和发光效果
    vec4 glowColor = vec4(uGlowColor, 1.0) * glow.a * intensity;
    gl_FragColor = texture + glowColor;
}
`;

export class GlowPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    private glowColor: number[];
    private intensity: number;
    private speed: number;

    constructor(game: Phaser.Game) {
        super({
            game,
            name: 'Glow',
            fragShader,
            uniforms: [
                'uTime',
                'uSpeed',
                'uResolution',
                'uIntensity',
                'uGlowColor'
            ]
        });

        this.glowColor = [1, 1, 0]; // 默认黄色发光
        this.intensity = 1;
        this.speed = 2;
    }

    onBind(): void {
        const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        this.setFloat1('uTime', this.game.loop.time / 1000);
        this.setFloat1('uSpeed', this.speed);
        this.setFloat2('uResolution', renderer.width, renderer.height);
        this.setFloat1('uIntensity', this.intensity);
        this.setFloat3('uGlowColor', ...this.glowColor);
    }

    setGlowColor(color: number): this {
        const rgb = Phaser.Display.Color.IntegerToRGB(color);
        this.glowColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
        return this;
    }

    setIntensity(value: number): this {
        this.intensity = value;
        return this;
    }

    setSpeed(value: number): this {
        this.speed = value;
        return this;
    }
} 
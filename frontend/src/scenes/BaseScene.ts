import { Scene } from 'phaser';

export class BaseScene extends Scene {

    constructor(key: string) {
        super(key);
    }

    init(data?: any): void {
        // 场景初始化逻辑
        console.log(`Initializing scene: ${this.scene.key}`);
        

    }

    preload(): void {
        // 资源预加载
        this.load.on('progress', (value: number) => {
            console.log(`Loading: ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            console.log('Loading complete');
        });
    }

    create(data?: any): void {
        // 场景创建逻辑
        console.log(`Creating scene: ${this.scene.key}`);
    }

    update(time: number, delta: number): void {
        // 场景更新逻辑
    }

    protected addButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Text {
        const button = this.add.text(x, y, text, {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        button.setInteractive()
            .on('pointerover', () => {
                button.setStyle({ color: '#ff0' });
            })
            .on('pointerout', () => {
                button.setStyle({ color: '#fff' });
            })
            .on('pointerdown', onClick);

        return button;
    }

    protected createBackground(texture: string): void {
        const bg = this.add.image(0, 0, texture);
        bg.setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }
} 
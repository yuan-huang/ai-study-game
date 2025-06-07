export class PathManager {
    private scene: Phaser.Scene;
    private gameContainer: Phaser.GameObjects.Container;
    private gameAreaWidth: number;
    private gameAreaHeight: number;
    private path: Phaser.Math.Vector2[] = [];

    constructor(scene: Phaser.Scene, gameContainer: Phaser.GameObjects.Container, gameAreaWidth: number, gameAreaHeight: number) {
        this.scene = scene;
        this.gameContainer = gameContainer;
        this.gameAreaWidth = gameAreaWidth;
        this.gameAreaHeight = gameAreaHeight;
    }

    public createAndDrawPath(): void {
        this.createPath();
        this.drawPath();
    }

    private createPath(): void {
        // 根据游戏容器的实际尺寸创建路径
        const pathMargin = 50;
        const pathPoints = [
            { x: pathMargin, y: this.gameAreaHeight * 0.2 },
            { x: this.gameAreaWidth * 0.25, y: this.gameAreaHeight * 0.2 },
            { x: this.gameAreaWidth * 0.25, y: this.gameAreaHeight * 0.6 },
            { x: this.gameAreaWidth * 0.4, y: this.gameAreaHeight * 0.6 },
            { x: this.gameAreaWidth * 0.4, y: this.gameAreaHeight * 0.2 },
            { x: this.gameAreaWidth * 0.6, y: this.gameAreaHeight * 0.2 },
            { x: this.gameAreaWidth * 0.6, y: this.gameAreaHeight * 0.8 },
            { x: this.gameAreaWidth * 0.8, y: this.gameAreaHeight * 0.8 },
            { x: this.gameAreaWidth * 0.8, y: this.gameAreaHeight * 0.4 },
            { x: this.gameAreaWidth - pathMargin, y: this.gameAreaHeight * 0.4 }
        ];

        this.path = pathPoints.map(point => new Phaser.Math.Vector2(point.x, point.y));
    }

    private drawPath(): void {
        // 游戏区域背景
        const gameBg = this.scene.add.rectangle(0, 0, this.gameAreaWidth, this.gameAreaHeight, 0x8fbc8f, 0.3);
        gameBg.setOrigin(0, 0);
        gameBg.setStrokeStyle(2, 0x4a7c59, 1); // 添加边框
        this.gameContainer.add(gameBg);

        const graphics = this.scene.add.graphics();
        graphics.lineStyle(80, 0x8B4513, 1);
        
        if (this.path.length > 1) {
            graphics.beginPath();
            graphics.moveTo(this.path[0].x, this.path[0].y);
            
            for (let i = 1; i < this.path.length; i++) {
                graphics.lineTo(this.path[i].x, this.path[i].y);
            }
            
            graphics.strokePath();
        }
        
        // 添加起点和终点标记
        const startCircle = this.scene.add.circle(this.path[0].x, this.path[0].y, 30, 0x00ff00);
        const endCircle = this.scene.add.circle(this.path[this.path.length - 1].x, this.path[this.path.length - 1].y, 30, 0xff0000);
        
        // 将路径元素添加到游戏容器
        this.gameContainer.add([graphics, startCircle, endCircle]);
    }

    public getPath(): Phaser.Math.Vector2[] {
        return this.path;
    }

    public getStartPoint(): Phaser.Math.Vector2 | null {
        return this.path.length > 0 ? this.path[0] : null;
    }

    public getEndPoint(): Phaser.Math.Vector2 | null {
        return this.path.length > 0 ? this.path[this.path.length - 1] : null;
    }

    public destroy(): void {
        // 路径相关的清理工作
        this.path = [];
    }
} 
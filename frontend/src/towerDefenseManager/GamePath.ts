import { PathPoint, DEFAULT_PATH } from '@/config/TowerDefenseConfig';

/**
 * 游戏路径管理类
 * 替代 Phaser.Geom.Path，提供自定义路径功能
 */
export class GamePath {
    private points: PathPoint[];
    private graphics?: Phaser.GameObjects.Graphics;

    constructor(points: PathPoint[] = DEFAULT_PATH) {
        this.points = [...points];
    }

    /**
     * 获取路径点
     */
    public getPoints(): PathPoint[] {
        return [...this.points];
    }

    /**
     * 获取指定索引的路径点
     */
    public getPoint(index: number): PathPoint | undefined {
        return this.points[index];
    }

    /**
     * 获取路径长度（点的数量）
     */
    public getLength(): number {
        return this.points.length;
    }

    /**
     * 在场景中绘制路径
     */
    public draw(scene: Phaser.Scene, color: number = 0x8B4513, width: number = 20): void {
        if (this.graphics) {
            this.graphics.destroy();
        }

        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(width, color, 1);

        if (this.points.length < 2) return;

        // 移动到起始点
        this.graphics.moveTo(this.points[0].x, this.points[0].y);

        // 绘制线段到各个点
        for (let i = 1; i < this.points.length; i++) {
            this.graphics.lineTo(this.points[i].x, this.points[i].y);
        }

        // 绘制路径
        this.graphics.strokePath();

        // 标记为游戏对象
        this.graphics.setData('gameObject', true);
        this.graphics.setData('entityType', 'path');
    }

    /**
     * 获取两点之间的距离
     */
    public getDistanceBetweenPoints(index1: number, index2: number): number {
        const point1 = this.points[index1];
        const point2 = this.points[index2];
        
        if (!point1 || !point2) return 0;
        
        return Math.sqrt(
            (point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2
        );
    }

    /**
     * 获取路径总长度
     */
    public getTotalDistance(): number {
        let totalDistance = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            totalDistance += this.getDistanceBetweenPoints(i, i + 1);
        }
        return totalDistance;
    }

    /**
     * 获取指定距离处的点坐标
     */
    public getPointAtDistance(distance: number): PathPoint {
        if (distance <= 0) return { ...this.points[0] };
        
        let currentDistance = 0;
        for (let i = 0; i < this.points.length - 1; i++) {
            const segmentDistance = this.getDistanceBetweenPoints(i, i + 1);
            
            if (currentDistance + segmentDistance >= distance) {
                // 在这个线段上
                const ratio = (distance - currentDistance) / segmentDistance;
                const point1 = this.points[i];
                const point2 = this.points[i + 1];
                
                return {
                    x: point1.x + (point2.x - point1.x) * ratio,
                    y: point1.y + (point2.y - point1.y) * ratio
                };
            }
            
            currentDistance += segmentDistance;
        }
        
        // 距离超出路径长度，返回终点
        return { ...this.points[this.points.length - 1] };
    }

    /**
     * 添加路径点
     */
    public addPoint(point: PathPoint): void {
        this.points.push({ ...point });
    }

    /**
     * 插入路径点
     */
    public insertPoint(index: number, point: PathPoint): void {
        this.points.splice(index, 0, { ...point });
    }

    /**
     * 移除路径点
     */
    public removePoint(index: number): void {
        if (index >= 0 && index < this.points.length) {
            this.points.splice(index, 1);
        }
    }

    /**
     * 清空路径
     */
    public clear(): void {
        this.points = [];
    }

    /**
     * 设置新的路径点
     */
    public setPoints(points: PathPoint[]): void {
        this.points = [...points];
    }

    /**
     * 销毁路径图形
     */
    public destroy(): void {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = undefined;
        }
    }

    /**
     * 检查点是否在路径附近
     */
    public isPointNearPath(point: PathPoint, threshold: number = 30): boolean {
        for (let i = 0; i < this.points.length - 1; i++) {
            const distance = this.getDistanceFromPointToLineSegment(
                point,
                this.points[i],
                this.points[i + 1]
            );
            
            if (distance <= threshold) {
                return true;
            }
        }
        return false;
    }

    /**
     * 计算点到线段的距离
     */
    private getDistanceFromPointToLineSegment(
        point: PathPoint,
        lineStart: PathPoint,
        lineEnd: PathPoint
    ): number {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            // 线段退化为点
            return Math.sqrt(A * A + B * B);
        }
        
        let param = dot / lenSq;

        let xx: number, yy: number;

        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
} 
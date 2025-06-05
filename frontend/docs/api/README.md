# API 文档

## 游戏核心类

### KnowledgeGarden

游戏主类，负责初始化和管理游戏实例。

```typescript
class KnowledgeGarden {
    constructor(containerId: string);
    destroy(): void;
}
```

### 场景 (Scenes)

#### BaseScene
所有场景的基类，提供基础功能。

```typescript
class BaseScene extends Phaser.Scene {
    constructor(key: string);
    init(data?: any): void;
    preload(): void;
    create(data?: any): void;
    update(time: number, delta: number): void;
    protected addButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Text;
    protected createBackground(texture: string): void;
}
```

#### LoadingScene
游戏加载场景，显示加载进度。

```typescript
class LoadingScene extends BaseScene {
    constructor();
    preload(): void;
    private createLoadingBar(): void;
    private updateLoadingBar(value: number): void;
    private loadAssets(): void;
    private onLoadComplete(): void;
}
```

### 实体 (Entities)

#### Player
玩家角色类。

```typescript
interface PlayerStats {
    health: number;
    maxHealth: number;
    speed: number;
    level: number;
    experience: number;
}

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, x: number, y: number, texture: string, stats?: Partial<PlayerStats>);
    update(time: number, delta: number): void;
    takeDamage(amount: number): void;
    heal(amount: number): void;
    gainExperience(amount: number): void;
    getStats(): PlayerStats;
    isDying(): boolean;
}
```

### 管理器 (Managers)

#### AssetManager
资源管理器，负责加载和管理游戏资源。

```typescript
interface AssetConfig {
    key: string;
    path: string;
    type: 'image' | 'spritesheet' | 'audio' | 'json';
    options?: any;
}

class AssetManager {
    static loadAll(scene: Scene): void;
    static getAssetPath(key: string): string;
    static getAssetConfig(key: string): AssetConfig | undefined;
}
```

## 事件系统

游戏中使用的主要事件：

- `playerDamaged`: 玩家受伤时触发
- `playerHealed`: 玩家恢复生命时触发
- `playerDied`: 玩家死亡时触发
- `experienceGained`: 获得经验时触发
- `updateHealth`: 更新生命值显示
- `updateExperience`: 更新经验值显示
- `updateLevel`: 更新等级显示
- `updateScore`: 更新分数显示

## 配置系统

### GameConfig

游戏主配置。

```typescript
const GameConfig: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: isDev
        }
    }
    // ... 其他配置
};
``` 
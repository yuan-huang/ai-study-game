# 敌人图片资源

## 📁 文件列表

### 基础兵种
- `enemy_basic_idle.png` - 基础兵待机 (32x32px)
- `enemy_basic_walk_01.png` - 基础兵行走帧1 (32x32px)
- `enemy_basic_walk_02.png` - 基础兵行走帧2 (32x32px)
- `enemy_basic_death.png` - 基础兵死亡 (32x32px)

### 装甲兵种
- `enemy_armored_idle.png` - 装甲兵待机 (40x40px)
- `enemy_armored_walk_01.png` - 装甲兵行走帧1 (40x40px)
- `enemy_armored_walk_02.png` - 装甲兵行走帧2 (40x40px)
- `enemy_armored_death.png` - 装甲兵死亡 (40x40px)

### 快速兵种
- `enemy_fast_idle.png` - 快速兵待机 (24x24px)
- `enemy_fast_walk_01.png` - 快速兵行走帧1 (24x24px)
- `enemy_fast_walk_02.png` - 快速兵行走帧2 (24x24px)
- `enemy_fast_death.png` - 快速兵死亡 (24x24px)

### BOSS兵种
- `enemy_boss_idle.png` - BOSS待机 (64x64px)
- `enemy_boss_walk_01.png` - BOSS行走帧1 (64x64px)
- `enemy_boss_walk_02.png` - BOSS行走帧2 (64x64px)
- `enemy_boss_attack.png` - BOSS攻击 (64x64px)
- `enemy_boss_death.png` - BOSS死亡 (64x64px)

## 🎨 设计要求

### 基本要求
- 图片格式：PNG (支持透明背景)
- 背景：透明
- 中心对齐：图片中心即为敌人位置

### 不同兵种特色
- **基础兵**：简单造型，普通颜色
- **装甲兵**：有明显护甲，厚重感
- **快速兵**：轻盈造型，运动感
- **BOSS**：威猛造型，特殊效果

### 动画帧要求
- 行走动画：至少2帧，体现移动感
- 死亡动画：可选，增强游戏体验
- 攻击动画：仅BOSS需要

## 📏 推荐尺寸

| 敌人类型 | 建议尺寸 | 代码中size值 |
|----------|----------|--------------|
| 基础兵   | 32x32px  | 12          |
| 装甲兵   | 40x40px  | 15          |
| 快速兵   | 24x24px  | 10          |
| BOSS    | 64x64px  | 20          |

## 📋 命名规范

文件命名格式：`enemy_{类型}_{状态}.png`

示例：
- 基础兵待机：`enemy_basic_idle.png`
- BOSS攻击：`enemy_boss_attack.png`

## 🔧 在代码中的使用

敌人图片在游戏中通过以下方式使用：

```javascript
// 目前使用的简化版本（仅idle状态）
const imageKey = `enemy_${this.type}`;
// 例如：enemy_basic, enemy_boss

// 获取图片并渲染
const enemyImage = imageLoader.getImage(imageKey);
if (enemyImage) {
    const size = this.size * 2;
    ctx.drawImage(enemyImage, x - size/2, y - size/2, size, size);
}
```

## 🎬 动画扩展

未来可以扩展为支持动画的版本：

```javascript
// 扩展版本（支持动画）
const frame = Math.floor(this.animationTime / 500) % 2; // 每500ms切换帧
const imageKey = `enemy_${this.type}_walk_0${frame + 1}`;
``` 
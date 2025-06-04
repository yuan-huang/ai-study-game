# 防御塔图片资源

## 📁 文件列表

### 箭塔 (Arrow Tower)
- `arrow_tower_lv1.png` - 1级箭塔 (64x64px)
- `arrow_tower_lv2.png` - 2级箭塔 (64x64px) 
- `arrow_tower_lv3.png` - 3级箭塔 (64x64px)

### 炮塔 (Cannon Tower)
- `cannon_tower_lv1.png` - 1级炮塔 (64x64px)
- `cannon_tower_lv2.png` - 2级炮塔 (64x64px)
- `cannon_tower_lv3.png` - 3级炮塔 (64x64px)

### 冰塔 (Ice Tower)
- `ice_tower_lv1.png` - 1级冰塔 (64x64px)
- `ice_tower_lv2.png` - 2级冰塔 (64x64px)
- `ice_tower_lv3.png` - 3级冰塔 (64x64px)

### 魔法塔 (Magic Tower)
- `magic_tower_lv1.png` - 1级魔法塔 (64x64px)
- `magic_tower_lv2.png` - 2级魔法塔 (64x64px)
- `magic_tower_lv3.png` - 3级魔法塔 (64x64px)

### 共用组件
- `tower_base.png` - 塔底座 (80x80px)
- `tower_range_indicator.png` - 射程指示器 (透明PNG)

## 🎨 设计要求

### 基本要求
- 图片格式：PNG (支持透明背景)
- 尺寸：64x64像素 (主体塔身)
- 背景：透明
- 中心对齐：图片中心即为塔的放置点

### 升级视觉差异
- **1级**：基础造型，颜色较暗
- **2级**：增加装饰元素，颜色更亮
- **3级**：最华丽，可能有光效或特殊装饰

### 风格要求
- 卡通风格或像素艺术风格
- 色彩鲜明，易于区分
- 与游戏整体风格保持一致

## 📋 命名规范

文件命名格式：`{塔类型}_tower_lv{等级}.png`

示例：
- 1级箭塔：`arrow_tower_lv1.png`
- 3级魔法塔：`magic_tower_lv3.png`

## 🔧 在代码中的使用

塔的图片在游戏中通过以下方式加载和使用：

```javascript
// 自动生成图片键名
const imageKey = `${this.type}_tower_lv${this.level}`;
// 例如：arrow_tower_lv2

// 获取图片并渲染
const towerImage = imageLoader.getImage(imageKey);
if (towerImage) {
    ctx.drawImage(towerImage, x, y, 64, 64);
}
``` 
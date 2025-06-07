# Phaser.js 阿里巴巴字体配置指南

## 📖 概述

本指南介绍如何在Phaser.js游戏中统一使用阿里巴巴开源字体，提供现代、美观、一致的中文字体体验。

## 🚀 快速开始

### 1. 基本配置

在`main.ts`中，字体会自动初始化：

```typescript
// 字体自动加载流程：
// 1. 加载基础字体文件
await fontManager.loadAlibabaPuHuiTi();

// 2. 初始化Phaser字体配置  
await PhaserFontConfig.initializeGameFonts();
```

### 2. 在场景中使用

继承`BaseScene`并调用字体方法：

```typescript
import { BaseScene } from '../scenes/BaseScene';

export class MyGameScene extends BaseScene {
    create(): void {
        super.create(); // 重要：确保字体已初始化
        
        // 创建标题
        this.createText(400, 100, '我的游戏', 'TITLE_LARGE');
        
        // 创建按钮
        this.addButton(400, 200, '开始游戏', () => {
            console.log('游戏开始');
        });
    }
}
```

## 📝 API 参考

### 创建文本

#### `createText()` - 基础文本创建

```typescript
createText(
    scene: Phaser.Scene,
    x: number,
    y: number, 
    text: string,
    stylePreset?: keyof typeof TextStyles,
    customStyle?: Partial<Phaser.Types.GameObjects.Text.TextStyle>
): Phaser.GameObjects.Text
```

**示例：**
```typescript
// 使用预设样式
const title = createText(this, 400, 100, '游戏标题', 'TITLE_LARGE');

// 使用自定义样式
const customText = createText(this, 400, 200, '自定义文本', 'BODY_TEXT', {
    color: '#ff0000',
    fontSize: 28
});
```

#### `createAnimatedText()` - 动画文本创建

```typescript
createAnimatedText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string, 
    stylePreset: keyof typeof TextStyles,
    animationType: 'fadeIn' | 'slideIn' | 'bounceIn' | 'typewriter'
): Phaser.GameObjects.Text
```

**示例：**
```typescript
// 淡入效果
const fadeText = createAnimatedText(this, 400, 100, '淡入文本', 'UI_TEXT', 'fadeIn');

// 打字机效果
const typeText = createAnimatedText(this, 400, 200, '打字机效果', 'BODY_TEXT', 'typewriter');
```

## 🎨 预设样式

### 可用样式预设

| 样式名称 | 用途 | 字体 | 大小 | 颜色 |
|---------|------|------|------|------|
| `TITLE_LARGE` | 主标题 | 数黑体 | 48px | #1a1a1a |
| `TITLE_MEDIUM` | 副标题 | 数黑体 | 32px | #2d3748 |
| `TITLE_SMALL` | 小标题 | 普惠体 | 24px | #4a5568 |
| `BODY_TEXT` | 正文 | 普惠体 | 20px | #4a5568 |
| `BUTTON_TEXT` | 按钮文字 | 普惠体 | 18px | #ffffff |
| `NUMBER_TEXT` | 数字显示 | 数黑体 | 28px | #e53e3e |
| `LABEL_TEXT` | 标签文字 | 普惠体 | 16px | #718096 |
| `UI_TEXT` | UI文字 | 普惠体 | 16px | #ffffff |
| `ERROR_TEXT` | 错误信息 | 普惠体 | 18px | #e53e3e |
| `SUCCESS_TEXT` | 成功信息 | 普惠体 | 18px | #38a169 |
| `DECORATIVE_TEXT` | 装饰文字 | 东方大楷 | 36px | #744210 |

### 字体栈

```typescript
// 可用字体栈
FontStacks.PUHUITI    // 阿里巴巴普惠体 + 降级方案
FontStacks.SUHEI      // 阿里妈妈数黑体 + 降级方案  
FontStacks.DONGFANG   // 阿里妈妈东方大楷 + 降级方案
FontStacks.SYSTEM     // 系统字体降级方案
```

## 📱 响应式设计

### 响应式字体大小

```typescript
// 根据屏幕宽度自动调整字体大小
const responsiveSize = PhaserFontConfig.getResponsiveFontSize(24, this.cameras.main.width);

const text = createText(this, 400, 100, '响应式文本', 'BODY_TEXT', {
    fontSize: responsiveSize
});
```

### 响应式样式

```typescript
// 获取适应屏幕的样式
const baseStyle = TextStyles.BODY_TEXT;
const responsiveStyle = PhaserFontConfig.getResponsiveStyle(baseStyle, this.cameras.main.width);

const text = this.add.text(400, 100, '响应式文本', responsiveStyle);
```

## 🔧 实用工具

### 更新现有文本样式

```typescript
// 动态更新文本样式
PhaserFontConfig.updateTextStyle(textObject, 'TITLE_LARGE', {
    color: '#ff0000'
});
```

### 批量更新场景字体

```typescript
// 更新场景中所有文本对象的字体
PhaserFontConfig.updateSceneTextFonts(this);
```

### 字体加载状态检查

```typescript
// 检查字体是否已加载
if (PhaserFontConfig.isFontLoaded()) {
    console.log('字体已加载，可以正常使用');
} else {
    console.log('字体加载中或失败，使用降级方案');
}
```

## 💡 最佳实践

### 1. 场景初始化

```typescript
export class MyScene extends BaseScene {
    create(): void {
        super.create(); // 必须调用，确保字体初始化
        
        // 您的场景代码...
    }
}
```

### 2. 字体选择建议

- **标题文字**：使用 `TITLE_LARGE`、`TITLE_MEDIUM`、`TITLE_SMALL`
- **正文内容**：使用 `BODY_TEXT`
- **按钮文字**：使用 `BUTTON_TEXT`
- **数字显示**：使用 `NUMBER_TEXT`
- **UI标签**：使用 `LABEL_TEXT` 或 `UI_TEXT`
- **特殊装饰**：使用 `DECORATIVE_TEXT`

### 3. 性能优化

- 字体在游戏启动时预加载，避免运行时延迟
- 使用预设样式减少重复配置
- 响应式字体大小按需计算

### 4. 错误处理

```typescript
try {
    const text = createText(this, 400, 100, '测试文本', 'TITLE_LARGE');
} catch (error) {
    console.warn('字体创建失败，使用降级方案:', error);
    // 使用系统字体作为降级
    const fallbackText = this.add.text(400, 100, '测试文本', {
        fontFamily: FontStacks.SYSTEM,
        fontSize: 48
    });
}
```

## 🎮 游戏场景示例

### 主菜单场景

```typescript
export class MainMenuScene extends BaseScene {
    create(): void {
        super.create();
        
        // 游戏标题
        this.createText(
            this.cameras.main.centerX, 
            150, 
            '知识花园', 
            'TITLE_LARGE'
        ).setOrigin(0.5);
        
        // 副标题
        this.createText(
            this.cameras.main.centerX,
            220,
            '探索学习的奇妙世界',
            'TITLE_SMALL'
        ).setOrigin(0.5);
        
        // 按钮组
        this.addButton(
            this.cameras.main.centerX,
            350,
            '开始游戏',
            () => this.scene.start('GameScene')
        ).setOrigin(0.5);
    }
}
```

### 游戏HUD场景

```typescript
export class GameHUDScene extends BaseScene {
    private scoreText!: Phaser.GameObjects.Text;
    private healthText!: Phaser.GameObjects.Text;
    
    create(): void {
        super.create();
        
        // 分数显示
        this.scoreText = this.createText(50, 30, '分数: 0', 'NUMBER_TEXT');
        
        // 生命值显示  
        this.healthText = this.createText(50, 70, '生命: 100', 'UI_TEXT');
        
        // 提示信息
        this.createText(
            this.cameras.main.centerX,
            this.cameras.main.height - 50,
            '使用 WASD 移动角色',
            'LABEL_TEXT'
        ).setOrigin(0.5);
    }
    
    updateScore(score: number): void {
        this.scoreText.setText(`分数: ${score}`);
    }
    
    updateHealth(health: number): void {
        this.healthText.setText(`生命: ${health}`);
        
        // 根据生命值改变颜色
        const color = health > 50 ? '#38a169' : health > 20 ? '#f6ad55' : '#e53e3e';
        this.healthText.setColor(color);
    }
}
```

## 🐛 常见问题

### Q: 字体显示为方块或乱码？
A: 检查字体是否正确加载，可以调用 `PhaserFontConfig.isFontLoaded()` 检查状态。

### Q: 字体在不同设备上大小不一致？
A: 使用 `getResponsiveFontSize()` 方法获取适应屏幕的字体大小。

### Q: 如何添加新的字体样式？
A: 在 `PhaserFontConfig.PRESET_STYLES` 中添加新的样式配置。

### Q: 移动端字体模糊？
A: 确保 Phaser 配置中的 `render.antialias` 设置合适的值。

## 🔗 相关链接

- [阿里巴巴普惠体官网](https://alibaba.github.io/puhuiti/)
- [阿里妈妈字体官网](https://www.alibabafonts.com/)
- [Phaser 文本对象文档](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Text.html)

---

## 📄 完整配置文件位置

- **主配置**: `frontend/src/config/PhaserFontConfig.ts`
- **基础场景**: `frontend/src/scenes/BaseScene.ts`
- **字体管理**: `frontend/src/utils/fontManager.ts`
- **使用示例**: `frontend/src/examples/PhaserFontUsageExample.ts` 
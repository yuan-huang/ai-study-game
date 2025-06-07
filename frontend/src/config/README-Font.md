# 游戏字体配置指南

本项目使用阿里开源字体系列，提供统一、美观的中文显示效果。

## 📚 字体介绍

### 1. 阿里巴巴普惠体 (Alibaba-PuHuiTi)
- **用途**: 正文、按钮、标签等日常文本
- **特点**: 可读性强，现代简洁，适合长文本阅读
- **字重**: Light(300)、Regular(400)、Medium(500)、Bold(700)、Heavy(900)

### 2. 阿里妈妈数黑体 (Alibaba-Sans)
- **用途**: 标题、重要信息、数字显示
- **特点**: 几何感强，现代时尚，视觉冲击力强
- **字重**: Light(300)、Regular(400)、Bold(700)、Black(900)

### 3. 阿里妈妈东方大楷 (Alibaba-Dongfang)
- **用途**: 装饰性文字、特殊场景
- **特点**: 书法风格，文化气息浓厚
- **字重**: Regular(400)

## 🚀 快速开始

### 1. 导入字体配置
```typescript
import { 
    PhaserTextStyles, 
    createStyledText, 
    FontLoader 
} from '../config/FontConfig';
```

### 2. 加载字体
```typescript
// 在游戏启动时自动加载，也可以手动加载
await FontLoader.loadAllFonts();
```

### 3. 创建文本
```typescript
// 使用预定义样式
const title = createStyledText(
    this,      // scene
    400, 300,  // x, y
    '游戏标题', // text
    'mainTitle' // style key
);

// 直接使用样式对象
const text = this.add.text(100, 100, '内容', PhaserTextStyles.bodyText);
```

## 🎨 样式类型

| 样式名称 | 用途 | 字体 | 大小 | 颜色 |
|---------|------|------|------|------|
| `mainTitle` | 主标题 | 数黑体 | 48px | #1a1a1a |
| `subTitle` | 副标题 | 数黑体 | 32px | #2d3748 |
| `bodyText` | 正文 | 普惠体 | 24px | #4a5568 |
| `buttonText` | 按钮文字 | 普惠体 | 20px | #ffffff |
| `labelText` | 标签文字 | 普惠体 | 16px | #718096 |
| `numberText` | 数字文字 | 数黑体 | 28px | #e53e3e |
| `decorativeText` | 装饰文字 | 东方大楷 | 36px | #744210 |

## 🛠️ 高级用法

### 1. 响应式字体大小
```typescript
import { getResponsiveFontSize } from '../config/FontConfig';

const fontSize = getResponsiveFontSize(24, this.cameras.main.width);
const text = this.add.text(100, 100, '响应式文本', {
    fontFamily: 'Alibaba-PuHuiTi',
    fontSize: fontSize
});
```

### 2. 动态更新样式
```typescript
import { updateTextStyle } from '../config/FontConfig';

const text = this.add.text(100, 100, '可变样式文本', PhaserTextStyles.bodyText);
// 点击后改变样式
text.setInteractive();
text.on('pointerdown', () => {
    updateTextStyle(text, 'mainTitle');
});
```

### 3. 使用工具类
```typescript
import { FontUtils } from '../examples/FontUsageExample';

// 创建带背景的文本框
const textBox = FontUtils.createTextBox(
    this, 400, 300, '提示信息', 'bodyText', 0x000000, 0.8
);

// 创建打字机效果
const typewriterText = FontUtils.createTypewriterText(
    this, 400, 400, '逐字显示的文本', 'bodyText', 100
);

// 创建脉冲动画文本
const pulseText = FontUtils.createPulseText(
    this, 400, 500, '脉冲文本', 'mainTitle'
);
```

## 🔧 CSS中使用

### 1. 全局变量
```css
:root {
    --font-puhuiti: 'Alibaba-PuHuiTi', sans-serif;
    --font-suhei: 'Alibaba-Sans', sans-serif;
    --font-dongfang: 'Alibaba-Dongfang', serif;
}
```

### 2. 应用字体
```css
.game-title {
    font-family: var(--font-suhei);
    font-weight: 700;
    font-size: 2rem;
}

.game-content {
    font-family: var(--font-puhuiti);
    font-weight: 400;
    font-size: 1rem;
}
```

## 📱 响应式设计

字体大小会根据屏幕尺寸自动调整：
- 基准屏幕宽度：1920px
- 最小缩放比例：0.5x
- 最大缩放比例：2x

## ⚡ 性能优化

1. **字体预加载**: 字体在游戏启动时预加载，避免运行时延迟
2. **样式复用**: 使用预定义样式减少重复配置
3. **响应式计算**: 字体大小按需计算，避免过度渲染

## 🐛 常见问题

### Q: 字体加载失败怎么办？
A: 字体会自动降级到系统字体，检查网络连接和CDN可用性。

### Q: 如何添加新的字体样式？
A: 在 `PhaserTextStyles` 对象中添加新的样式配置。

### Q: 移动端字体显示异常？
A: 检查字体URL的HTTPS支持，确保移动端网络稳定。

## 🔗 相关链接

- [阿里巴巴普惠体](https://alibaba.github.io/puhuiti/)
- [阿里妈妈数黑体](https://www.alibabafonts.com/)
- [Phaser文本对象文档](https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Text.html) 
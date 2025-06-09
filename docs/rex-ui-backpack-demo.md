# Rex-UI 甘露背包实现说明

## 概述

甘露背包使用了Phaser的专业UI插件 `rex-ui` 来实现，相比手动实现滚动和布局，rex-ui提供了更专业、更稳定的UI组件。

## 主要组件

### 1. Sizer（布局管理器）
```typescript
this.backpackPanel = this.rexUI.add.sizer({
    x: centerX,
    y: centerY,
    width: 600,
    height: 600,
    orientation: 'vertical',
    space: { item: 10 }
});
```

**优势**：
- 自动布局管理
- 响应式尺寸调整
- 垂直/水平布局支持

### 2. ScrollablePanel（可滚动面板）
```typescript
this.scrollablePanel = this.rexUI.add.scrollablePanel({
    width: 580,
    height: 450,
    scrollMode: 'vertical',
    background: this.rexUI.add.roundRectangle(0, 0, 580, 450, 10, 0xf8f8f8, 1),
    panel: {
        child: this.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 5 }
        }),
        mask: {
            padding: 1
        }
    },
    slider: {
        track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0xcccccc),
        thumb: this.rexUI.add.roundRectangle(0, 0, 20, 50, 10, 0x4caf50)
    }
});
```

**优势**：
- 内置滚动条支持
- 鼠标滚轮支持
- 自动裁剪内容
- 自定义滚动条样式

### 3. Dialog（对话框）
```typescript
const dialog = this.rexUI.add.dialog({
    x: this.cameras.main.width / 2,
    y: this.cameras.main.height / 2,
    width: 400,
    height: 350,
    background: this.rexUI.add.roundRectangle(0, 0, 400, 350, 20, 0xffffff, 1),
    title: titleComponent,
    content: contentComponent,
    actions: [closeButtonComponent],
    space: {
        title: 25,
        content: 25,
        action: 15
    }
})
.layout()
.popUp(300);
```

**优势**：
- 模态对话框
- 自动布局和间距
- 内置动画效果
- 事件处理

### 4. RoundRectangle（圆角矩形）
```typescript
const itemBg = this.rexUI.add.roundRectangle(0, 0, 560, 100, 10, 0xf5f5f5, 1)
    .setStrokeStyle(2, this.getNectarColor(nectar.subject));
```

**优势**：
- 现代化圆角设计
- 支持边框和填充
- 可用作背景组件

## 实现对比

### 手动实现 vs Rex-UI

| 功能 | 手动实现 | Rex-UI实现 |
|------|----------|------------|
| 滚动面板 | 需要手写遮罩、事件处理 | 内置ScrollablePanel |
| 布局管理 | 手动计算位置 | 自动Sizer布局 |
| 对话框 | 手写弹窗逻辑 | 内置Dialog组件 |
| 响应式 | 复杂的尺寸计算 | 自动适应 |
| 代码量 | 500+ 行 | 300+ 行 |
| 维护性 | 较低 | 较高 |

## 核心代码结构

```typescript
export class BackpackScene extends BaseScene {
    // Rex-UI组件
    private backpackPanel: any = null;      // 主面板
    private scrollablePanel: any = null;    // 滚动面板

    private createRexUIBackpack(): void {
        // 1. 创建主布局容器
        this.backpackPanel = this.rexUI.add.sizer({...});
        
        // 2. 添加统计信息面板
        const statsPanel = this.createStatsPanel();
        this.backpackPanel.add(statsPanel);
        
        // 3. 创建滚动列表
        this.scrollablePanel = this.rexUI.add.scrollablePanel({...});
        this.backpackPanel.add(this.scrollablePanel);
        
        // 4. 布局并显示
        this.backpackPanel.layout().setDepth(50);
    }

    private createRexNectarItem(nectar: NectarData): any {
        // 使用Sizer创建每个甘露项目
        const itemSizer = this.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 15 }
        });
        
        // 添加背景、图标、文本、数量等元素
        // ...
        
        return itemSizer.layout();
    }
}
```

## 优势总结

1. **专业性**：rex-ui是专门为Phaser设计的UI插件
2. **稳定性**：经过大量项目验证，bug更少
3. **效率**：减少代码量，提高开发效率
4. **维护性**：组件化设计，易于维护和扩展
5. **一致性**：统一的API和设计模式
6. **功能完整**：内置常用UI组件和交互

## 使用建议

- 对于复杂的UI界面，优先使用rex-ui
- 简单的按钮和文本可以继续使用原生Phaser
- 利用rex-ui的布局管理器减少手动计算
- 充分利用内置的动画和交互效果 
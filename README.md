# 知识花园游戏 (Knowledge Garden Game)

一个融合游戏化学习和知识管理的创新项目，通过培养知识之花来构建个人的知识花园。

## 🎒 最新功能：甘露背包 (Rex-UI版本)

现在花园场景中新增了使用rex-ui实现的专业甘露背包功能：

### 技术特点
- **🏗️ Rex-UI架构**：使用Phaser的专业UI插件rex-ui构建
- **📦 Sizer布局**：自动适应的响应式布局管理
- **📜 ScrollablePanel**：内置的专业滚动面板组件
- **🎭 Dialog对话框**：优雅的模态对话框系统
- **🎨 圆角UI组件**：现代化的圆角矩形和标签组件

### 功能特点
- **📊 库存管理**：显示所有甘露的数量、种类和治疗力
- **🔍 详细信息**：点击甘露查看详细的学科、年级、分类等信息  
- **📱 流畅滚动**：rex-ui原生支持的滚动条和鼠标滚轮
- **🎨 彩色分类**：不同学科的甘露用不同颜色区分
- **🔙 便捷返回**：一键返回花园场景

### 使用方法
1. 在花园场景中点击右上角的背包图标（🎒）
2. 浏览你拥有的所有甘露（支持滚动条）
3. 点击任意甘露打开详细信息对话框
4. 使用返回按钮回到花园场景

### Rex-UI组件使用
```typescript
// ScrollablePanel - 可滚动面板
this.rexUI.add.scrollablePanel({
    width: 580,
    height: 450,
    scrollMode: 'vertical'
});

// Sizer - 布局管理器
this.rexUI.add.sizer({
    orientation: 'horizontal',
    space: { item: 15 }
});

// Dialog - 对话框
this.rexUI.add.dialog({
    title: titleComponent,
    content: contentComponent,
    actions: [buttonComponent]
});
```

### 甘露数据结构
每个甘露包含以下信息：
- **学科**：语文、数学、英语等
- **年级**：对应的年级级别
- **分类**：具体的知识点分类
- **治疗力**：可以恢复花朵HP的总量
- **数量**：拥有的甘露数量

## 技术栈

### 后端
- Node.js + TypeScript
- MongoDB
- Express.js
- Socket.IO (实时通信)
- OpenAI API (AI 互动)

### 前端
- React 18
- TypeScript
- Vite
- Zustand (状态管理)
- TailwindCSS
- Framer Motion (动画效果)

## 主要功能

- 🌱 知识种子系统
  - 种子获取与培养
  - 成长阶段转换
  - 知识果实收获

- 🎯 任务系统
  - 日常学习任务
  - 复习强化任务
  - 知识巩固挑战

- 👤 用户系统
  - 无密码登录
  - 经验等级体系
  - 成就系统

- 🏆 社交功能
  - 知识花园展示
  - 排行榜
  - 好友互动

## 🍯 甘露系统

### 功能概述
甘露系统是知识花园的核心治疗机制，用于恢复花朵的记忆HP，防止知识遗忘。

### 后端接口

#### 1. 甘露查询接口
- **路径**: `GET /api/garden/nectar/:userId`
- **功能**: 获取用户的甘露库存
- **响应数据**:
  ```json
  {
    "success": true,
    "data": {
      "nectars": [
        {
          "id": "甘露ID",
          "subject": "学科",
          "grade": "年级",
          "category": "分类", 
          "totalHealingPower": "总治疗力",
          "count": "数量",
          "nectarIds": ["甘露ID数组"]
        }
      ],
      "totalNectars": "甘露总数",
      "totalTypes": "甘露类型数"
    }
  }
  ```

#### 2. 甘露使用接口
- **路径**: `POST /api/garden/use-nectar`
- **功能**: 使用甘露治疗花朵
- **请求参数**:
  ```json
  {
    "userId": "用户ID",
    "flowerId": "花朵ID", 
    "nectarId": "甘露ID",
    "healingAmount": "治疗量（可选）"
  }
  ```

### 前端交互体验

#### 甘露飘动效果
- 花园场景中显示最多5个飘动的甘露
- 甘露根据学科显示不同颜色:
  - 🔴 语文: 红色 (#FF6B6B)
  - 🔵 英语: 蓝色 (#45B7D1)  
  - 🟦 数学: 青色 (#4ECDC4)
  - 🟠 科技: 橙色 (#FFA726)
  - 🟢 海洋: 绿色 (#66BB6A)

#### 拖拽治疗机制
1. **拖拽操作**: 鼠标拖拽甘露到花朵上
2. **碰撞检测**: 智能识别甘露与花朵的距离
3. **治疗效果**: 显示HP恢复动画和数值
4. **库存更新**: 自动扣除甘露并刷新显示

#### 视觉反馈
- 甘露悬停时显示详细信息
- 拖拽时花朵高亮提示
- 治疗成功播放光效和数字动画
- 甘露消耗后自动重新生成

### 技术实现特点
- 基于 Phaser 3 游戏引擎的流畅拖拽体验
- MongoDB 事务确保甘露使用的数据一致性
- 实时的 HP 计算和遗忘曲线应用
- 优雅的动画和特效系统

## 快速开始

### 后端启动
```
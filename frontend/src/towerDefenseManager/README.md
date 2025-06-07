# 塔防游戏架构重构

## 概述

这次重构将原本的 `TowerDefenseScene.ts` 中的逻辑分离到多个专门的管理器中，提高了代码的可维护性和可扩展性。

## 架构设计

### 主管理器 - TowerDefenseManager
- **文件**: `TowerDefenseManager.ts`
- **职责**: 整合各个子管理器，提供统一的接口
- **主要功能**:
  - 初始化各个子管理器
  - 统一的游戏更新循环
  - 事件监听和分发
  - 游戏状态管理

### 子管理器

#### 1. 塔管理器 - TowerManager
- **文件**: `TowerManager.ts`
- **职责**: 管理所有塔相关功能
- **主要功能**:
  - 塔的配置管理（类型、成本、伤害、范围等）
  - 塔的创建和销毁
  - 塔的放置系统（放置模式、位置验证、范围显示）
  - 塔的攻击逻辑
  - 塔的升级系统

#### 2. 怪物管理器 - MonsterManager
- **文件**: `MonsterManager.ts`
- **职责**: 管理所有怪物相关功能
- **主要功能**:
  - 怪物类型配置（血量、速度、奖励等）
  - 怪物的创建和销毁
  - 怪物的移动和更新
  - 波次配置管理
  - 怪物生成队列管理

#### 3. 路径管理器 - PathManager
- **文件**: `PathManager.ts`
- **职责**: 管理游戏路径
- **主要功能**:
  - 路径的创建和绘制
  - 路径点的获取
  - 起点和终点管理
  - 游戏区域背景绘制

#### 4. 题目管理器 - QuestionManager
- **文件**: `QuestionManager.ts`
- **职责**: 管理题目生成和验证
- **主要功能**:
  - 根据年级和科目生成题目
  - 题目池管理
  - 答案验证
  - **预留API调用接口** - 为后续调用服务器API获取题目做准备

#### 5. 投射物管理器 - ProjectileManager
- **文件**: `ProjectileManager.ts`
- **职责**: 管理投射物
- **主要功能**:
  - 投射物的创建和更新
  - 投射物的生命周期管理
  - 投射物的碰撞检测

## 使用方式

### 新的场景文件
- **文件**: `TowerDefenseSceneRefactored.ts`
- **使用**: 使用新的管理器架构
- **特点**: 代码更简洁，逻辑更清晰

### 原场景文件
- **文件**: `TowerDefenseScene.ts` 
- **状态**: 保留原有代码，作为对比参考

## 重构优势

1. **模块化**: 每个管理器职责单一，便于维护和测试
2. **可扩展性**: 新功能可以通过扩展相应管理器实现
3. **代码复用**: 管理器可以在其他游戏模式中复用
4. **易于测试**: 每个管理器可以独立测试
5. **API准备**: 题目管理器已预留API调用接口

## 后续扩展

### 1. API集成
题目管理器中的 `loadQuestionsFromAPI` 方法已经准备好，可以直接调用后端API：

```typescript
// 调用API获取题目
const questions = await this.questionManager.loadQuestionsFromAPI({
    subject: '数学',
    grade: 3,
    category: '加减法',
    count: 50
});
```

### 2. 新游戏模式
可以轻松创建新的游戏模式，复用现有管理器：
- 无尽模式
- 挑战模式
- 多人对战模式

### 3. 新功能扩展
- 塔的技能系统
- 怪物的特殊能力
- 道具系统
- 成就系统

## 文件结构

```
frontend/src/tower-defense/
├── TowerDefenseManager.ts    # 主管理器
├── TowerManager.ts          # 塔管理器
├── MonsterManager.ts        # 怪物管理器
├── PathManager.ts           # 路径管理器
├── QuestionManager.ts       # 题目管理器
├── ProjectileManager.ts     # 投射物管理器
└── README.md               # 说明文档
```

## 使用示例

```typescript
// 在场景中初始化管理器
private initializeManager(): void {
    this.towerDefenseManager = new TowerDefenseManager(
        this,                    // Phaser场景
        this.gameContainer,      // 游戏容器
        this.gameState,          // 游戏状态
        this.userConfig,         // 用户配置
        this.gameAreaWidth,      // 游戏区域宽度
        this.gameAreaHeight      // 游戏区域高度
    );
    
    // 初始化路径
    this.towerDefenseManager.initializePath();
    
    // 生成题目
    this.towerDefenseManager.generateQuestions();
}

// 在更新循环中
update(time: number, delta: number): void {
    this.towerDefenseManager.update(time, delta);
}
```

这种架构使得代码更加清晰、可维护，并为未来的功能扩展提供了良好的基础。 
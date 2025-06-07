# 塔防游戏迁移指南

## 问题说明

原始的 `TowerDefenseScene.ts` 文件在重构过程中出现了兼容性问题。建议使用新的重构版本。

## 推荐解决方案

### 方案1：使用重构后的场景（推荐）

使用 `TowerDefenseSceneRefactored.ts`，这是使用新管理器架构的完整重构版本。

#### 如何切换：

1. 在需要启动塔防游戏的地方，将场景名称改为 `'TowerDefenseSceneRefactored'`

```typescript
// 原来的代码
this.scene.start('TowerDefenseScene', {
    subject: userConfig.subject,
    grade: userConfig.grade,
    category: userConfig.category,
    userLevel: userConfig.userLevel
});

// 改为
this.scene.start('TowerDefenseSceneRefactored', {
    subject: userConfig.subject,
    grade: userConfig.grade,
    category: userConfig.category,
    userLevel: userConfig.userLevel
});
```

2. 确保在 Phaser 游戏配置中注册新场景：

```typescript
// 在你的游戏配置中
import { TowerDefenseSceneRefactored } from '@/scenes/levels/TowerDefenseSceneRefactored';

const config: Phaser.Types.Core.GameConfig = {
    // ... 其他配置
    scene: [
        // ... 其他场景
        TowerDefenseSceneRefactored,
    ]
};
```

### 方案2：修复原始文件（不推荐）

如果你确实需要使用原始文件，需要手动恢复被删除的属性和方法。这会比较复杂，建议使用方案1。

## 重构版本的优势

1. **更好的架构**：代码分离到专门的管理器中
2. **更容易维护**：每个功能模块职责单一
3. **更好的扩展性**：容易添加新功能
4. **API准备**：题目管理器预留了API调用接口
5. **相同的功能**：保持了原有的所有游戏功能

## 功能对比

| 功能 | 原始版本 | 重构版本 | 状态 |
|------|---------|----------|------|
| 塔防游戏核心功能 | ✅ | ✅ | 完全相同 |
| 题目生成 | ✅ | ✅ | 完全相同 |
| UI界面 | ✅ | ✅ | 完全相同 |
| 波次管理 | ✅ | ✅ | 完全相同 |
| 代码维护性 | ❌ | ✅ | 重构版本更好 |
| 扩展性 | ❌ | ✅ | 重构版本更好 |
| API支持 | ❌ | ✅ | 重构版本支持 |

## 迁移步骤

1. 备份当前代码（如果需要）
2. 修改场景启动代码，使用 `TowerDefenseSceneRefactored`
3. 在游戏配置中注册新场景
4. 测试游戏功能是否正常
5. 如果一切正常，可以删除原始的 `TowerDefenseScene.ts`

## 注意事项

- 重构版本保持了相同的外部接口，所以切换应该是无缝的
- 如果你有自定义的修改，需要在重构版本中重新应用
- 新版本使用了管理器模式，如果需要添加功能，请查看相应的管理器文件

## 需要帮助？

如果在迁移过程中遇到问题，请查看：

1. `frontend/src/tower-defense/README.md` - 详细的架构说明
2. `TowerDefenseSceneRefactored.ts` - 新版本的实现
3. 各个管理器文件 - 了解具体功能的实现

建议直接使用重构版本，它提供了更好的代码结构和扩展性。 
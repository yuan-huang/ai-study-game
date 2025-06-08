# 花园API使用示例

## 🌺 概览

优化后的花园API采用了类似 `questionApi.ts` 的设计模式，提供了更好的类型安全、错误处理和使用体验。

## 🔧 主要改进

### 1. 服务类模式
```typescript
// 使用单例实例
import { gardenApi } from '@/api/gardenApi';

// 或者导入服务类
import { GardenApiService } from '@/api/gardenApi';
const customGardenApi = new GardenApiService();
```

### 2. 统一的请求工具
```typescript
// 使用通用的 request 工具，提供：
// - 统一的错误处理
// - 认证头自动处理
// - 标准化的响应格式
import { get, post, ApiResponse } from '../utils/request';
```

### 3. 双重调用方式
```typescript
// 方式1：直接参数调用
await gardenApi.plantFlower(userId, flowerId, position);

// 方式2：参数对象调用
await gardenApi.plantFlowerWithParams({
  userId,
  flowerId,
  position
});
```

## 🎯 API 使用示例

### 基础花园操作

#### 种植花朵
```typescript
import { gardenApi, PlantFlowerParams } from '@/api/gardenApi';

// 直接参数调用
const plantResponse = await gardenApi.plantFlower(
  'user123',
  'flower456',
  { x: 2, y: 3 }
);

// 参数对象调用
const params: PlantFlowerParams = {
  userId: 'user123',
  flowerId: 'flower456',
  position: { x: 2, y: 3 }
};
const plantResponse2 = await gardenApi.plantFlowerWithParams(params);

// 处理响应
if (plantResponse.success) {
  console.log('种植成功:', plantResponse.data);
} else {
  console.error('种植失败:', plantResponse.message);
}
```

#### 收获花朵
```typescript
// 收获花朵到仓库
const harvestResponse = await gardenApi.harvestFlower('user123', 'flower456');

if (harvestResponse.success) {
  const flower = harvestResponse.data;
  console.log(`收获了${flower.subject}花朵，HP: ${flower.hp}/${flower.maxHp}`);
}
```

#### 移动花朵
```typescript
// 移动花朵到新位置
const moveResponse = await gardenApi.moveFlower(
  'user123',
  'flower456',
  { x: 5, y: 6 }
);
```

### 甘露治疗

```typescript
import { HealFlowerParams } from '@/api/gardenApi';

// 使用甘露治疗花朵
const healParams: HealFlowerParams = {
  userId: 'user123',
  flowerId: 'flower456',
  nectarSubject: 'math',
  nectarGrade: 4,
  nectarCategory: '几何',
  healingAmount: 20
};

const healResponse = await gardenApi.healFlowerWithParams(healParams);

if (healResponse.success) {
  console.log('治疗成功:', healResponse.data.flower);
  console.log('剩余甘露:', healResponse.data.remainingNectar);
}
```

### 获取花园数据

#### 获取完整花园状态
```typescript
// 获取花园布局和甘露信息
const warehouseResponse = await gardenApi.getGardenWarehouse('user123');

if (warehouseResponse.success) {
  const layout = warehouseResponse.data;
  console.log(`花园状态:
    - 总花朵数: ${layout.totalFlowers}
    - 已种植: ${layout.plantedFlowersCount}
    - 仓库中: ${layout.warehouseFlowersCount}
    - 甘露种类: ${layout.nectars.length}
  `);
}
```

#### 获取记忆状态
```typescript
// 获取花园记忆健康度
const memoryResponse = await gardenApi.getGardenMemoryState('user123');

if (memoryResponse.success) {
  const memoryData = memoryResponse.data;
  console.log(`记忆状态:
    - 平均HP: ${memoryData.memoryHealth.averageHP}
    - 健康花朵: ${memoryData.memoryHealth.healthyFlowers}
    - 危险花朵: ${memoryData.memoryHealth.criticalFlowers}
    - 整体评级: ${memoryData.memoryHealth.overallGrade}
  `);
  
  // 显示建议
  memoryData.memoryHealth.recommendations.forEach(rec => {
    console.log('建议:', rec);
  });
}
```

### 高级功能

#### 智能花园管理
```typescript
// 获取完整花园状态和智能建议
const smartResponse = await gardenApi.getSmartGardenState('user123');

if (smartResponse.success) {
  const { layout, memoryState, recommendations } = smartResponse.data;
  
  // 显示花园统计
  const stats = gardenApi.formatGardenStats(layout);
  console.log('花园统计:', stats.summary);
  console.log('详细信息:', stats.details);
  
  // 显示智能建议
  recommendations.forEach(rec => {
    console.log('智能建议:', rec);
  });
}
```

#### 批量操作
```typescript
// 批量种植花朵
const batchParams = [
  { userId: 'user123', flowerId: 'flower1', position: { x: 0, y: 0 } },
  { userId: 'user123', flowerId: 'flower2', position: { x: 1, y: 0 } },
  { userId: 'user123', flowerId: 'flower3', position: { x: 2, y: 0 } }
];

const batchResponse = await gardenApi.batchPlantFlowers(batchParams);

if (batchResponse.success) {
  console.log(`批量种植成功，共种植 ${batchResponse.data.length} 朵花`);
}
```

#### 自动种植
```typescript
// 让系统自动选择位置种植
const autoResponse = await gardenApi.autoPlantFlower('user123', 'flower789');

if (autoResponse.success) {
  const flower = autoResponse.data;
  console.log(`自动种植到位置 (${flower.gardenPosition?.x}, ${flower.gardenPosition?.y})`);
}
```

### 工具方法

#### 使用内置工具方法
```typescript
// 获取花朵精灵名称
const spriteName = gardenApi.getFlowerSprite('math'); // 'flower-math'

// 获取花朵颜色
const color = gardenApi.getFlowerColor('chinese'); // 0xFF4444

// 获取HP条颜色
const hpColor = gardenApi.getHPColor(30, 100); // 0xFF0000 (红色)

// 获取记忆状态描述
const status = gardenApi.getMemoryStatusDescription(75, 100); // '记忆良好'

// 计算推荐治疗量
const recommendedHealing = gardenApi.calculateRecommendedHealing(flower, nectars);
```

#### 权限验证
```typescript
// 验证用户是否有权限操作某个花朵
const hasPermission = await gardenApi.validateGardenOperation('user123', 'flower456');

if (hasPermission) {
  // 执行操作
  await gardenApi.harvestFlower('user123', 'flower456');
} else {
  console.log('无权限操作此花朵');
}
```

## 🎮 在 Phaser 场景中使用

### 花园场景集成示例
```typescript
import { gardenApi, FlowerData, GardenLayout } from '@/api/gardenApi';

export class GardenScene extends BaseScene {
  private gardenData: GardenLayout | null = null;
  private currentUserId: string = 'user123';

  async loadGardenData(): Promise<void> {
    try {
      // 使用智能花园管理获取完整状态
      const response = await gardenApi.getSmartGardenState(this.currentUserId);
      
      if (response.success && response.data) {
        this.gardenData = response.data.layout;
        
        // 显示智能建议
        response.data.recommendations.forEach(rec => {
          this.showMessage(rec);
        });
        
        // 更新UI
        this.displayFlowersInToolbar();
        this.displayNectarsInToolbar();
        this.displayPlantedFlowers();
      } else {
        this.showMessage('加载花园数据失败: ' + response.message);
      }
    } catch (error) {
      console.error('加载花园数据失败:', error);
      this.showMessage('网络连接错误');
    }
  }

  async handleFlowerDrop(flower: FlowerData, gridX: number, gridY: number): Promise<void> {
    try {
      // 使用新的API进行种植
      const response = await gardenApi.plantFlower(
        this.currentUserId,
        flower.id,
        { x: gridX, y: gridY }
      );
      
      if (response.success) {
        this.showMessage('🌺 种植成功！');
        // 重新加载数据
        await this.loadGardenData();
      } else {
        this.showMessage('种植失败: ' + response.message);
      }
    } catch (error) {
      this.showMessage('种植操作失败，请重试');
    }
  }

  async handleFlowerHeal(flower: FlowerData, nectar: NectarData): Promise<void> {
    try {
      // 计算推荐治疗量
      const recommendedAmount = gardenApi.calculateRecommendedHealing(
        flower, 
        this.gardenData?.nectars || []
      );
      
      if (recommendedAmount === 0) {
        this.showMessage('没有合适的甘露');
        return;
      }
      
      // 执行治疗
      const response = await gardenApi.healFlower(
        this.currentUserId,
        flower.id,
        nectar.subject,
        nectar.grade,
        nectar.category,
        recommendedAmount
      );
      
      if (response.success) {
        this.showMessage(`💧 治疗成功！恢复 ${recommendedAmount} HP`);
        await this.loadGardenData();
      } else {
        this.showMessage('治疗失败: ' + response.message);
      }
    } catch (error) {
      this.showMessage('治疗操作失败，请重试');
    }
  }
}
```

## 🔄 错误处理

### 标准错误处理模式
```typescript
try {
  const response = await gardenApi.someOperation();
  
  if (response.success) {
    // 操作成功
    console.log('操作成功:', response.data);
    if (response.message) {
      console.log('提示信息:', response.message);
    }
  } else {
    // 操作失败
    console.error('操作失败:', response.message);
    // 显示用户友好的错误信息
    showUserMessage(response.message);
  }
} catch (error) {
  // 网络错误或其他异常
  console.error('请求异常:', error);
  showUserMessage('网络连接错误，请检查网络设置');
}
```

## 🎯 最佳实践

### 1. 类型安全
```typescript
// 使用TypeScript接口确保类型安全
import { PlantFlowerParams, FlowerData, ApiResponse } from '@/api/gardenApi';

const params: PlantFlowerParams = {
  userId: 'user123',
  flowerId: 'flower456',
  position: { x: 2, y: 3 }
};
```

### 2. 错误处理
```typescript
// 总是检查响应状态
if (response.success) {
  // 成功处理
} else {
  // 失败处理，显示 response.message
}
```

### 3. 性能优化
```typescript
// 使用并行请求获取多个数据
const [layoutResponse, memoryResponse] = await Promise.all([
  gardenApi.getGardenWarehouse(userId),
  gardenApi.getGardenMemoryState(userId)
]);
```

### 4. 用户体验
```typescript
// 操作前验证权限
const hasPermission = await gardenApi.validateGardenOperation(userId, flowerId);
if (!hasPermission) {
  showMessage('无权限操作此花朵');
  return;
}

// 使用工具方法提供更好的UI反馈
const statusColor = gardenApi.getHPColor(flower.hp, flower.maxHp);
const statusText = gardenApi.getMemoryStatusDescription(flower.hp, flower.maxHp);
```

---

## ✅ 总结

优化后的花园API提供了：

- ✅ **类型安全**: 完整的TypeScript类型定义
- ✅ **双重调用方式**: 支持直接参数和参数对象调用
- ✅ **统一错误处理**: 标准化的错误处理和响应格式
- ✅ **工具方法**: 内置常用的工具函数
- ✅ **智能功能**: 智能建议和批量操作
- ✅ **性能优化**: 并行请求和高效的数据处理
- ✅ **用户友好**: 清晰的错误信息和操作反馈

现在您可以使用这个优化后的API来构建更稳定、更高效的花园功能！🌺 
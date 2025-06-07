# 关卡接口使用指南

## 概述

关卡接口用于获取不同学科和年级的题目分类信息，支持动态加载关卡数据。

## API端点

### 1. 获取关卡列表

**GET** `/api/levels`

获取指定学科和年级的所有关卡分类信息。

#### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| subject | string | 是 | 学科代码 (chinese/math/english/curious/knowledge) |
| grade | number | 是 | 年级 (1-12) |

#### 响应格式

```json
{
  "success": true,
  "message": "获取关卡列表成功",
  "data": {
    "subject": "chinese",
    "grade": 4,
    "categories": [
      {
        "category": "古诗词",
        "count": 25,
        "difficulty_score": 2.3
      },
      {
        "category": "文学常识",
        "count": 18,
        "difficulty_score": 1.8
      }
    ]
  }
}
```

#### 示例请求

```bash
GET /api/levels?subject=chinese&grade=4
```

### 2. 获取关卡统计信息

**GET** `/api/levels/stats`

获取特定关卡的详细统计信息。

#### 请求参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| subject | string | 是 | 学科代码 |
| grade | number | 是 | 年级 |
| category | string | 是 | 分类名称 |

#### 响应格式

```json
{
  "success": true,
  "message": "获取关卡统计信息成功",
  "data": {
    "subject": "chinese",
    "grade": 4,
    "category": "古诗词",
    "totalQuestions": 25,
    "avgDifficulty": 2.3,
    "avgCorrectRate": 0.78,
    "allTags": ["古诗词", "语文", "4年级", "唐诗"]
  }
}
```

#### 示例请求

```bash
GET /api/levels/stats?subject=chinese&grade=4&category=古诗词
```

## 前端使用示例

### 在前端Scene中使用

```typescript
import { levelApi, LevelData } from '@/services/api';

export class LevelSelectScene extends BaseScene {
    private levelData: LevelData[] = [];

    async loadLevelData() {
        try {
            const response = await levelApi.getLevels(this.subject, this.grade);
            if (response.success && response.data) {
                this.levelData = response.data.categories;
                console.log('关卡数据加载成功:', this.levelData);
            }
        } catch (error) {
            console.error('加载关卡数据失败:', error);
        }
    }
}
```

### 调用API获取统计信息

```typescript
async function getLevelDetails(subject: string, grade: number, category: string) {
    const response = await levelApi.getLevelStats(subject, grade, category);
    if (response.success) {
        console.log('关卡统计:', response.data);
        return response.data;
    }
    return null;
}
```

## 数据结构说明

### LevelData 接口

```typescript
interface LevelData {
    category: string;        // 题目分类 (如：古诗词、文学常识)
    count: number;          // 该关卡题目数量
    difficulty_score: number; // 平均难度分数 (0-5)
}
```

### LevelResponse 接口

```typescript
interface LevelResponse {
    subject: string;        // 学科代码
    grade: number;         // 年级
    categories: LevelData[]; // 关卡分类数组
}
```

## 错误处理

### 常见错误码

- `400` - 请求参数错误
- `404` - 关卡数据不存在
- `500` - 服务器内部错误

### 错误响应格式

```json
{
  "success": false,
  "message": "缺少必需参数: subject 和 grade"
}
```

## 支持的学科和年级

### 学科代码

- `chinese` - 语文塔
- `math` - 数学塔  
- `english` - 英语塔
- `curious` - 好奇树
- `knowledge` - 知识花园

### 年级范围

支持1-12年级的数据查询。

## 测试

运行测试脚本验证API功能：

```bash
# 启动后端服务
cd backend
npm run dev

# 运行测试脚本
node src/test-level-api.js
```

## 注意事项

1. **数据依赖**：确保MongoDB中存在对应的题目数据集合
2. **集合命名规则**：`questions_{subject}_grade{grade}`
3. **性能考虑**：使用聚合查询优化大数据集的查询性能
4. **错误处理**：前端需要处理网络错误和空数据情况

## 数据库集合示例

```
knowledge-garden
├── questions_chinese_grade4
├── questions_chinese_grade5  
├── questions_math_grade4
├── questions_math_grade5
└── ...
```

每个集合包含的字段结构参考 `Question` 模型定义。 
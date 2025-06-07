# 塔防游戏API文档

## 概述

塔防游戏API提供了获取题目、怪物配置和塔类型数据的接口，用于支持前端塔防游戏的运行。

## 接口详情

### 获取塔防游戏数据

**接口地址：** `POST /api/tower-defense/data`

**描述：** 获取塔防游戏所需的题目、怪物和塔配置数据

#### 请求参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| subject | string | 是 | - | 学科（math/数学、chinese/语文、english/英语等） |
| grade | number | 是 | - | 年级（1-12） |
| category | string | 是 | - | 分类名称 |
| questionCount | number | 否 | 20 | 题目数量（5-100） |
| waveCount | number | 否 | 5 | 波次数量（1-20） |
| difficulty | number | 否 | 2 | 难度等级（1-5） |

#### 请求示例

```json
{
  "subject": "数学",
  "grade": 4,
  "category": "基础运算",
  "questionCount": 15,
  "waveCount": 5,
  "difficulty": 2
}
```

#### 响应格式

```json
{
  "success": true,
  "message": "获取塔防数据成功",
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "5 + 3 = ?",
        "options": ["8", "7", "9", "6"],
        "correct": "8",
        "difficulty": "中等"
      }
    ],
    "monsters": {
      "types": [
        {
          "type": "monster-normal",
          "name": "普通怪物",
          "health": 50,
          "speed": 100,
          "reward": 7,
          "image": "monster-normal"
        }
      ],
      "waves": [
        {
          "waveNumber": 1,
          "enemies": ["monster-normal", "monster-normal"],
          "delay": 1800,
          "spawnInterval": 1300
        }
      ]
    },
    "towers": {
      "tower-arrow": {
        "type": "tower-arrow",
        "name": "箭塔",
        "cost": 50,
        "damage": 20,
        "range": 150,
        "fireRate": 1000,
        "level": 1,
        "maxLevel": 10,
        "icon": "🏹",
        "description": "基础防御塔，攻击单个敌人"
      }
    },
    "gameConfig": {
      "subject": "数学",
      "grade": 4,
      "category": "基础运算",
      "questionCount": 15,
      "waveCount": 5,
      "difficulty": 2,
      "initialHealth": 11,
      "initialScore": 140,
      "scorePerCorrectAnswer": 40,
      "comboBonus": 9
    }
  }
}
```

## 数据结构说明

### 题目数据 (Question)

- `id`: 题目ID
- `question`: 题目内容
- `options`: 选项数组
- `correct`: 正确答案
- `difficulty`: 难度等级（简单/中等/较难/困难）

### 怪物数据 (Monster)

- `type`: 怪物类型标识
- `name`: 怪物名称
- `health`: 生命值
- `speed`: 移动速度
- `reward`: 击杀奖励
- `image`: 图片资源名称

### 塔数据 (Tower)

- `type`: 塔类型标识
- `name`: 塔名称
- `cost`: 建造成本
- `damage`: 攻击力
- `range`: 攻击范围
- `fireRate`: 攻击间隔（毫秒）
- `level`: 当前等级
- `maxLevel`: 最大等级
- `icon`: 图标
- `description`: 描述

### 游戏配置 (GameConfig)

- `initialHealth`: 初始生命值
- `initialScore`: 初始积分
- `scorePerCorrectAnswer`: 每道题正确答案的积分奖励
- `comboBonus`: 连击奖励

## 错误处理

### 错误响应格式

```json
{
  "success": false,
  "message": "错误描述"
}
```

### 常见错误

- `400 Bad Request`: 参数错误
- `500 Internal Server Error`: 服务器内部错误

## 使用示例

### JavaScript/TypeScript

```typescript
async function getTowerDefenseData() {
  try {
    const response = await fetch('/api/tower-defense/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: '数学',
        grade: 4,
        category: '基础运算',
        questionCount: 20,
        waveCount: 5,
        difficulty: 2
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('获取数据成功:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('获取塔防数据失败:', error);
    throw error;
  }
}
```

## 测试

可以使用提供的测试脚本来验证API：

```bash
node test-tower-defense-api.js
```

## 注意事项

1. 题目生成基于传入的学科和年级，会自动调整难度
2. 怪物配置会根据难度等级动态调整属性
3. 游戏配置参数会根据难度等级自动平衡
4. API支持多种学科，包括数学、语文、英语等
5. 所有数值参数都有合理的范围限制 
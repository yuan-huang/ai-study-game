# 数据库初始化脚本

这个目录包含MongoDB数据库的初始化脚本，用于将`docs/data`目录下按学科分类的JSON数据文件导入到对应的数据库集合中。

## 📁 文件结构

```
docs/data/
├── chinese/
│   ├── grade4.json    -> questions_chinese_grade4 集合
│   ├── grade5.json    -> questions_chinese_grade5 集合
│   └── grade6.json    -> questions_chinese_grade6 集合
├── math/
│   ├── grade4.json    -> questions_math_grade4 集合
│   └── grade5.json    -> questions_math_grade5 集合
└── english/
    ├── grade4.json    -> questions_english_grade4 集合
    └── grade6.json    -> questions_english_grade6 集合
```

## 功能特性

- 🎯 **多学科支持**: 按学科和年级自动创建不同的数据库集合
- 🔄 **批量导入**: 自动读取data目录下所有JSON文件
- 📂 **智能分类**: 根据文件路径自动识别学科和年级
- 🔍 **数据验证**: 验证数据格式和必需字段
- 💾 **智能更新**: 支持数据更新（upsert操作）
- 🚫 **去重处理**: 自动检测并跳过重复题目
- 🏷️ **自动标签**: 根据学科和内容自动生成标签
- 📊 **详细日志**: 提供详细的处理过程和统计信息
- 🛡️ **错误处理**: 优雅的错误处理机制
- 🎚️ **灵活筛选**: 支持按学科、年级筛选处理

## 脚本说明

### 基础脚本 (init.js)
- 简单的数据导入功能
- 适合基本的数据初始化需求

### 高级脚本 (advanced-init.js)
- 增强的数据处理功能
- 支持命令行参数
- 数据验证和错误处理
- 自动生成标签和难度分数
- 创建数据库索引
- 生成统计报告

## 使用方法

### 1. 配置环境变量

在项目根目录创建`.env`文件，配置MongoDB连接信息：

```env
MONGODB_URI=mongodb://localhost:27017/knowledge-garden
```

### 2. 准备数据文件

按学科和年级组织JSON数据文件：

```
docs/data/
├── chinese/grade4.json    # 四年级语文
├── math/grade5.json       # 五年级数学
└── english/grade6.json    # 六年级英语
```

支持的数据格式：

```json
[
  {
    "id": 1,
    "question": "题目内容",
    "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
    "right_answer": "A",
    "category": "分类",
    "level": "难度等级",
    "explanation": "答案解释"
  }
]
```

脚本会自动：
- 从文件路径识别学科（chinese/math/english）
- 从文件名识别年级（grade4/grade5/grade6）
- 创建对应的集合（questions_chinese_grade4）
- 检测重复题目并自动跳过

### 3. 运行初始化脚本

```bash
# 进入项目目录
cd backend

# 基础初始化（处理所有学科）
node init/advanced-init.js

# 或使用npm命令
npm run init-db
```

### 4. 高级用法

```bash
# 预览模式（不实际操作数据库）
node init/advanced-init.js --dry-run

# 清除现有数据后重新导入
node init/advanced-init.js --clear

# 详细日志模式
node init/advanced-init.js --verbose

# 只处理特定学科
node init/advanced-init.js --subject chinese

# 只处理特定年级
node init/advanced-init.js --grade 4

# 处理特定学科的特定年级
node init/advanced-init.js --subject math --grade 5

# 组合使用
node init/advanced-init.js --clear --verbose --subject chinese
```

### 5. 通过npm scripts运行

项目已配置了以下npm命令：

```bash
# 基础初始化（所有学科）
npm run init-db

# 清除数据重新初始化
npm run init-db-clear

# 预览模式
npm run init-db-preview

# 详细日志模式
npm run init-db-verbose

# 按学科初始化
npm run init-chinese    # 只初始化语文
npm run init-math      # 只初始化数学
npm run init-english   # 只初始化英语

# 按年级初始化
npm run init-grade4    # 只初始化4年级
npm run init-grade5    # 只初始化5年级
npm run init-grade6    # 只初始化6年级
```

## 数据模型

脚本会根据学科和年级创建多个集合（如`questions_chinese_grade4`），每个集合包含以下字段：

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| id | Number | 是 | 题目唯一标识 |
| question | String | 是 | 题目内容（全局唯一） |
| options | Array | 是 | 选项数组 |
| right_answer | String | 是 | 正确答案 |
| category | String | 是 | 题目分类 |
| level | String | 是 | 难度等级 |
| explanation | String | 否 | 答案解释 |
| subject | String | 是 | 学科名称 |
| grade | Number | 是 | 年级 |
| source | String | 否 | 数据来源文件名 |
| tags | Array | 否 | 标签数组 |
| difficulty_score | Number | 否 | 难度分数 |
| usage_count | Number | 否 | 使用次数 |
| correct_rate | Number | 否 | 正确率 |
| createdAt | Date | 否 | 创建时间 |
| updatedAt | Date | 否 | 更新时间 |

## 输出示例

```
🚀 开始多学科数据初始化...
📡 连接MongoDB...
✅ MongoDB连接成功
📂 扫描数据目录: /path/to/docs/data
📄 找到 3 个JSON文件:
   - chinese_grade4: grade4.json
   - math_grade5: grade5.json
   - english_grade6: grade6.json

📖 处理文件: grade4.json -> questions_chinese_grade4
✅ grade4.json 验证通过 50/50 条题目
📖 处理文件: grade5.json -> questions_math_grade5
✅ grade5.json 验证通过 30/30 条题目
📖 处理文件: grade6.json -> questions_english_grade6
✅ grade6.json 验证通过 40/40 条题目

✅ 为 3 个集合创建索引成功

🎉 多学科数据初始化完成!
📊 处理统计:
   - 总计处理: 120 条题目
   - 新增: 115 条
   - 更新: 0 条
   - 重复跳过: 5 条
   - 验证错误: 0 条
   - 涉及集合: 3 个

📊 数据统计报告:
   - 找到 3 个题目集合
   - questions_chinese_grade4: 50 条题目
   - questions_math_grade5: 30 条题目
   - questions_english_grade6: 40 条题目

📈 汇总统计:
   - 题目总数: 120 条
   - 学科分布:
     * chinese: 50 条
     * math: 30 条
     * english: 40 条
   - 年级分布:
     * 4年级: 50 条
     * 5年级: 30 条
     * 6年级: 40 条

📡 数据库连接已关闭
✅ 多学科初始化脚本执行完成
```

## 注意事项

1. **数据备份**: 运行前请备份现有数据
2. **ID唯一性**: 确保每个题目的ID在全局范围内唯一
3. **数据格式**: JSON文件必须是数组格式
4. **MongoDB连接**: 确保MongoDB服务已启动
5. **权限**: 确保有数据库写入权限

## 故障排除

### 常见问题

1. **连接失败**: 检查MongoDB服务状态和连接字符串
2. **文件读取失败**: 检查文件路径和权限
3. **数据验证失败**: 检查JSON格式和必需字段
4. **插入失败**: 检查数据库权限和磁盘空间

### 调试模式

可以修改脚本中的日志级别来获取更详细的调试信息。 
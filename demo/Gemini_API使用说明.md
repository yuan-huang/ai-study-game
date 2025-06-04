# 🤖 智慧塔防游戏 - Gemini AI 题目生成系统

## 📋 功能说明

本系统集成了 Google Gemini AI，能够根据用户选择的年级、科目和学习内容，实时生成个性化的学习题目。

## 🚀 启动步骤

### 1. 安装Python依赖
确保您的系统已安装Python 3.7+，然后安装必要的依赖包：

```bash
pip install flask flask-cors requests
```

### 2. 启动Gemini API服务器

**方式一：使用批处理文件（推荐）**
双击运行 `start_gemini_server.bat`，脚本会自动：
- 检查Python环境
- 安装必要依赖
- 启动API服务器

**方式二：手动启动**
```bash
python gemini_server.py
```

### 3. 启动游戏服务器
保持Gemini API服务器运行，另开一个终端：
```bash
python server.py
```
或双击 `start_server.bat`

### 4. 访问游戏
打开浏览器访问：`http://localhost:8000`

## 🎯 AI功能特性

### 个性化题目生成
- **年级适配**：1-6年级难度自动调整
- **科目专业**：数学、语文、英语专项题目
- **自定义内容**：根据用户输入的学习重点生成相关题目
- **智能格式**：自动生成选择题格式，包含4个选项

### 科目特色

**数学**
- 1-2年级：10以内加减法、基础几何
- 3-4年级：乘法表、两位数运算、简单分数
- 5-6年级：小数、分数、百分数、面积计算

**语文**
- 1-2年级：汉字识别、拼音、基础词语
- 3-4年级：词语理解、成语、简单古诗
- 5-6年级：古诗词、文言文、修辞手法

**英语**
- 1-2年级：基础单词、字母、日常用语
- 3-4年级：常用词汇、简单语法、基础对话
- 5-6年级：时态语法、阅读理解、句型转换

## 🔧 技术架构

### 后端服务 (gemini_server.py)
- **端口**：5000
- **框架**：Flask + CORS
- **API接口**：`POST /generate_questions`
- **健康检查**：`GET /health`

### 前端集成 (game.js)
- 异步调用Gemini API
- 智能容错机制（API失败时使用本地题目）
- 实时状态显示

## 📡 API接口详情

### 题目生成接口
```
POST http://localhost:5000/generate_questions
Content-Type: application/json

{
  "grade": 3,
  "subject": "math", 
  "customContent": "乘法口诀"
}
```

### 响应格式
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "3 × 4 = ?",
      "options": ["10", "11", "12", "13"],
      "correct": "12",
      "grade": 3,
      "subject": "数学"
    }
  ],
  "config": {
    "grade": 3,
    "subject": "math",
    "customContent": "乘法口诀"
  }
}
```

## 🔥 Gemini API 配置

### API Key设置
当前使用的API Key已内置在代码中：
```
AIzaSyAyMT4q99XsXiLpqQz22MpeiXJpqJ96-YM
```

### 自定义API Key
如需使用自己的API Key，请修改 `gemini_server.py` 中的：
```python
GEMINI_API_KEY = "您的API密钥"
```

### API限制
- 每分钟请求限制：请参考Google API配额
- 响应时间：通常5-15秒
- 内容过滤：符合Google AI内容政策

## ⚠️ 故障排除

### 常见问题

**1. Gemini API调用失败**
- 检查网络连接
- 验证API Key是否有效
- 查看服务器控制台错误信息

**2. 依赖包安装失败**
```bash
pip install --upgrade pip
pip install flask flask-cors requests
```

**3. 跨域请求被阻止**
- 确保Gemini服务器已启动（端口5000）
- 检查浏览器控制台是否有CORS错误

**4. 题目格式解析错误**
- AI偶尔可能返回非标准格式
- 系统会自动降级到本地题目
- 可尝试重新生成

### 调试模式
启动服务器时会显示详细日志：
- API请求参数
- Gemini响应内容
- 题目解析过程
- 错误详细信息

## 🎮 用户体验

### AI准备流程
1. 用户提交学习配置
2. 显示AI准备动画（6个步骤）
3. 后台调用Gemini API
4. 实时显示生成状态
5. 成功后进入游戏

### 容错机制
- API失败时自动使用本地题目
- 用户体验不受影响
- 错误信息友好提示

## 📊 性能优化

### 缓存策略
- 可考虑添加题目缓存机制
- 减少重复API调用

### 异步处理
- 前端异步调用，不阻塞UI
- 后台多线程处理请求

## 🔐 安全考虑

- API Key应存储在环境变量中（生产环境）
- 添加请求频率限制
- 输入内容验证和过滤

## 🚀 未来扩展

- 支持更多AI模型（Claude、GPT等）
- 添加题目难度评估
- 学习进度分析
- 题目质量评分系统

---

## 📞 技术支持

如遇到问题，请检查：
1. Python环境是否正确
2. 网络连接是否正常
3. API服务器是否运行在5000端口
4. 浏览器控制台是否有错误信息

享受AI驱动的个性化学习体验！🎓✨ 
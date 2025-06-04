# 游戏开发MCP服务器 v2.0

一个专为游戏开发设计的全功能MCP (Model Context Protocol) 服务器，集成了图片生成、对话音效、背景音乐和数据库管理功能。

## 🎮 主要功能

### 🖼️ 图片生成服务
- **技术**: Gemini 2.0 Flash Preview Image Generation
- **功能**: 生成游戏角色、场景、道具等图片
- **支持风格**: 像素艺术、写实、卡通、动漫等
- **输出格式**: 多种尺寸 (256x256 到 1024x1024)

### 🎭 对话音效服务 (新增)
- **技术**: Gemini 2.5 Flash Preview TTS
- **功能**: NPC对话、角色配音、系统提示音效
- **支持角色**: 战士、法师、商人、公主、反派等预设角色
- **多语言**: 中文、英文、日文、韩文
- **情感表达**: 中性、快乐、愤怒、悲伤、兴奋、英雄气概等
- **参数控制**: 语速(0.25-4.0x)、音调(-20到+20)

### 🎼 背景音乐服务 (新增)
- **技术**: Lyria API (框架已就绪，等待API发布)
- **功能**: 主题音乐、战斗音乐、环境音乐生成
- **音乐类型**: 主题、战斗、探索、环境、胜利、失败、过场、菜单
- **风格支持**: 管弦乐、电子、摇滚、民谣、爵士等
- **高级功能**: 循环播放、乐器指定、时长控制

### 📊 数据库服务
- **技术**: MongoDB
- **功能**: 完整的CRUD操作
- **用途**: 玩家数据、游戏配置、资源管理

## 🚀 快速开始

### 前置要求
- Node.js 18+
- MongoDB (本地或云端)
- Gemini API密钥 (用于图片生成和对话音效)

### 安装步骤

1. **克隆并安装依赖**
```bash
git clone <repository-url>
cd mcp-server
npm install
```

2. **配置API密钥**
```bash
# 运行自动配置脚本
./configure-api.bat

# 或手动创建.env文件
echo "GEMINI_API_KEY=your_gemini_api_key" > .env
```

3. **启动MongoDB**
```bash
# 本地MongoDB (默认端口27017)
mongod
```

4. **编译和启动**
```bash
npm run build
npm start
```

## 🛠️ 配置说明

### 环境变量
创建 `.env` 文件，包含以下配置：

```env
# Gemini API (图片生成 + 对话音效)
GEMINI_API_KEY=your_gemini_api_key

# Lyria API (背景音乐 - 可选)
LYRIA_API_KEY=your_lyria_api_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/swl
```

### 简化配置
v2.0版本大大简化了配置过程：
- ✅ **统一API密钥**: 图片生成和对话音效都使用同一个GEMINI_API_KEY
- ✅ **无需Google Cloud**: 不再需要配置Google Cloud服务账号
- ✅ **即插即用**: 设置GEMINI_API_KEY后即可使用所有AI功能

### MongoDB配置
- 默认连接: `mongodb://localhost:27017/swl`
- 支持本地和云端MongoDB实例
- 自动创建集合和索引

## 📚 使用示例

### 生成游戏图片
```json
{
  "tool": "generate_game_image",
  "arguments": {
    "prompt": "一个勇敢的战士站在城堡前",
    "style": "pixel_art",
    "size": "512x512"
  }
}
```

### 生成对话音效 (Gemini TTS)
```json
{
  "tool": "generate_dialogue_audio",
  "arguments": {
    "text": "欢迎来到我的店铺！需要什么武器吗？",
    "character": "merchant",
    "emotion": "happy",
    "language": "zh-CN",
    "speed": 1.0,
    "pitch": 0
  }
}
```

### 生成背景音乐
```json
{
  "tool": "generate_game_music",
  "arguments": {
    "prompt": "史诗般的冒险主题，展现英雄的旅程",
    "musicType": "theme",
    "genre": "orchestral",
    "mood": "epic",
    "duration": 60,
    "isLooping": true
  }
}
```

### 数据库操作
```json
{
  "tool": "mongodb_insert",
  "arguments": {
    "collection": "players",
    "data": {
      "name": "英雄001",
      "level": 15,
      "class": "warrior"
    }
  }
}
```

## 🎯 支持的功能

### 图片生成
- **风格**: pixel_art, realistic, cartoon, anime, sci-fi
- **尺寸**: 256x256, 512x512, 1024x1024, 768x768
- **用途**: 角色设计、场景创建、道具制作

### 对话音效 (Gemini TTS)
- **模型**: gemini-2.5-flash-preview-tts
- **角色类型**: warrior, mage, rogue, merchant, guard, princess, villain, narrator
- **情感**: neutral, happy, sad, angry, excited, calm, serious, heroic
- **语言**: zh-CN, en-US, ja-JP, ko-KR
- **参数**: 语速(0.25-4.0x), 音调(-20到+20)
- **最大文本**: 5000字符
- **输出格式**: MP3, 24000Hz

### 背景音乐
- **音乐类型**: theme, battle, exploration, ambient, victory, defeat, cutscene, menu
- **风格**: orchestral, electronic, rock, folk, ambient, jazz, medieval, cinematic
- **情绪**: epic, mysterious, peaceful, intense, melancholic, joyful, dark, heroic
- **时长**: 5-300秒，支持循环播放

### 数据库操作
- **插入**: 单条/批量插入数据
- **查询**: 条件查询、排序、分页
- **更新**: 单条/批量更新
- **删除**: 单条/批量删除

## 🔧 开发和调试

### 编译项目
```bash
npm run build
```

### 开发模式
```bash
npm run dev
```

### 清理构建
```bash
npm run clean
```

### 测试配置
```bash
# 测试Gemini API
node -e "console.log(process.env.GEMINI_API_KEY ? '✅ Gemini API已配置' : '❌ 未找到Gemini API密钥')"
```

## 📁 项目结构

```
mcp-server/
├── src/
│   ├── index.ts                 # 主服务器文件
│   └── services/
│       ├── imageGeneration.ts   # 图片生成服务
│       ├── gameDialogueService.ts # 对话音效服务 (Gemini TTS)
│       ├── gameMusicService.ts  # 背景音乐服务
│       └── mongodbService.ts    # 数据库服务
├── examples/
│   └── usage-examples.json     # 使用示例
├── scripts/
│   ├── install.bat             # 自动安装脚本
│   └── configure-api.bat       # API配置脚本
├── generated_audio/            # 生成的音频文件
├── generated_music/            # 生成的音乐文件
├── package.json
├── tsconfig.json
├── mcp-config.json
└── README.md
```

## 🔐 安全说明

- **API密钥**: 妥善保管GEMINI_API_KEY，不要提交到版本控制
- **网络安全**: MongoDB连接使用认证和加密
- **文件权限**: 生成的音频文件存储在受限目录

## 📈 性能优化

- **并发处理**: 支持多个请求同时处理
- **缓存机制**: 音频文件和图片结果缓存
- **资源管理**: 自动清理临时文件
- **错误恢复**: 完善的错误处理和重试机制
- **降级处理**: 当Gemini TTS不可用时提供模拟音频

## 🆕 版本更新

### v2.0.0 (当前版本)
- ✨ 新增对话音效服务 (Gemini 2.5 Flash Preview TTS)
- ✨ 新增背景音乐服务 (Lyria API框架)
- 🔧 重构音效生成架构，使用统一的Gemini API
- 📚 更新文档和示例
- 🛠️ 简化配置流程，移除Google Cloud依赖
- ⚡ 提升性能和稳定性

### v1.0.0
- 🎮 基础游戏MCP服务器
- 🖼️ Gemini图片生成
- 📊 MongoDB数据库操作
- 🔊 基础音效生成

## 🎭 Gemini TTS 特色功能

### 角色化语音
- **9种预设角色**: 每个角色都有独特的声音特征
- **智能配置**: 根据角色自动选择最佳语音参数
- **情感表达**: 支持8种不同情感的语音表现

### 多语言支持
- **中文**: 多种音色，支持不同风格
- **英文**: 美式发音，适合国际化游戏
- **日文**: 标准日语发音
- **韩文**: 标准韩语发音

### 高级控制
- **语速调节**: 0.25-4.0倍速，适应不同场景
- **音调控制**: ±20半音调节，创造独特声音
- **实时生成**: 快速响应，适合实时游戏

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 故障排除

### 常见问题

**1. Gemini API错误**
- 检查API密钥是否正确
- 确认API配额未超限
- 验证网络连接

**2. Gemini TTS音频生成失败**
- 确认使用的是正确的模型名称
- 检查文本长度是否超过5000字符
- 验证语言和角色参数是否支持

**3. MongoDB连接失败**
- 确认MongoDB服务正在运行
- 检查连接字符串格式
- 验证网络连接

**4. 编译错误**
- 运行 `npm install` 重新安装依赖
- 检查TypeScript版本兼容性
- 清理并重新构建项目

### 获取帮助

- 查看 [examples/usage-examples.json](examples/usage-examples.json) 获取详细示例
- 阅读详细的错误日志
- 检查Gemini API官方文档

## 🌟 特色亮点

- 🎯 **专为游戏开发设计**: 所有功能都针对游戏开发场景优化
- 🔧 **统一API集成**: 使用单一Gemini API密钥即可使用多项AI功能
- 🎭 **角色化语音**: 为不同游戏角色提供独特的声音表现
- 🎵 **完整音频解决方案**: 从对话到背景音乐的全方位音频支持
- 📊 **数据管理**: 集成MongoDB进行游戏数据管理
- 🚀 **高性能**: 支持并发处理和智能缓存

---

🎮 **让游戏开发更简单，让创意无限可能！**

*使用Gemini AI的力量，为您的游戏注入生命力！* 
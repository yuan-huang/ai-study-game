# 知识花园游戏 (Knowledge Garden Game)

## 项目背景
本项目是谷歌Gemma开发者大赛参赛作品，由SWL团队开发。

## 项目简介
一个融合游戏化学习和知识管理的创新项目，通过培养知识之花来构建个人的知识花园。

## 愿景
让每个小孩子，能像玩游戏一般，快乐学习。
让家长不再烦恼
让老师方便管理

## demo访问路径
https://xuanpin.chat

## 核心玩法

### 🏝️ 学科岛闯关
- 个性化关卡题库，AI智能匹配学习进度
- 通关获得"知识种子"作为奖励

### 🌸 知识花园
- 种子在花园中生根发芽，可视化展现知识掌握程度
- 根据遗忘曲线自动更新植物状态，提醒温故知新
- 花园植物产出游戏道具，形成正向学习循环

### 🤖 AI NPC系统

**好奇树**
- 回答孩子的各种问题，激发好奇心
- 主动提问并根据回答质量给予奖励
- 培养孩子的探索精神和想象力

**花园精灵**
- 提供个性化任务清单和学习建议
- 解答学习难题，提供情绪陪伴
- 智能意图识别，精准回应不同类型问题

## 技术特色
- 基于Ollama 部署Gamma3 模型, 给游戏中npc赋予角色 的多Agent系统。
- Google Imagen生成精美游戏贴图
- 丰富的游戏机制：防御塔、怪物系统、战绩系统、成就系统
- AI模拟竞争对手，个性化调整竞争强度
- AI生成学习情况报告

## 后续
思路：通过将gammm3 模型进行微调，以适配游戏人物中NPC角色性质， 从而带来更好的游戏体验。

## ai调用路径
依赖 @google/genai包
backend/src/config/aiConfig.ts 配置类
backend/src/services/base/BaseAIService.ts
backend/src/services/GeminiService.ts 负责调用 gemini
backend/src/services/OllamaService.ts 负责调用 gemma3

使用的时候，在.env 配置参数 DEFAULT_AI_MODEL_TYPE=ollama


# 游戏部署
## 配置环境
复制backend中的 .env.example 改为 .env
配置key和mongodb数据库

## 导入题库
cd backend
npm run init-db

题目后续有一个题库管理页面，上传doc题库
在有AI模型，将题库进行抽离转换json



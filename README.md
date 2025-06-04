# 知识花园游戏 (Knowledge Garden Game)

一个融合游戏化学习和知识管理的创新项目，通过培养知识之花来构建个人的知识花园。

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

## 快速开始

### 后端启动
```bash
cd backend
npm install
npm run dev
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

## 环境要求

- Node.js >= 18
- MongoDB >= 5.0
- npm >= 8.0

## 项目结构

```
.
├── backend/                # 后端服务
│   ├── src/
│   │   ├── controllers/   # 业务逻辑控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由定义
│   │   ├── services/     # 业务服务
│   │   └── utils/        # 工具函数
│   └── tests/            # 测试文件
│
└── frontend/              # 前端应用
    ├── src/
    │   ├── components/   # 组件
    │   ├── pages/       # 页面
    │   ├── stores/      # 状态管理
    │   ├── services/    # API 服务
    │   └── utils/       # 工具函数
    └── public/          # 静态资源
``` 
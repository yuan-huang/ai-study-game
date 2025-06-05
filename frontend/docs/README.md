# 知识花园游戏前端文档

## 项目结构

```
frontend/
├── src/                      # 源代码目录
│   ├── game/                 # 游戏核心代码
│   │   ├── scenes/          # 场景管理
│   │   ├── entities/        # 游戏实体
│   │   ├── systems/         # 游戏系统
│   │   ├── managers/        # 管理器
│   │   ├── utils/           # 工具类
│   │   └── config/          # 配置文件
│   └── main.ts              # 入口文件
│
├── public/                   # 静态资源
│   └── assets/              # 游戏资源
│       ├── sprites/         # 精灵图片
│       ├── backgrounds/     # 背景图片
│       ├── ui/             # UI资源
│       ├── audio/          # 音频资源
│       └── data/           # 游戏数据
│
└── docs/                    # 文档目录
    ├── api/                # API文档
    ├── design/             # 设计文档
    └── guides/             # 使用指南
```

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

## 技术栈

- Phaser 3.70.0 - 游戏引擎
- TypeScript - 开发语言
- Vite - 构建工具

## 开发指南

请参考以下文档：

- [API文档](./api/README.md)
- [设计文档](./design/README.md)
- [使用指南](./guides/README.md) 
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

// 导入功能模块
import { ImageGenerationService } from "./services/imageGeneration.js";
import { MongoDBService } from "./services/mongodbService.js";
import { GameDialogueService } from "./services/gameDialogueService.js";
import { GameMusicService } from "./services/gameMusicService.js";

// 加载环境变量
dotenv.config();

class GameMCPServer {
  private server: Server;
  private imageService: ImageGenerationService;
  private mongoService: MongoDBService;
  private dialogueService: GameDialogueService;
  private musicService: GameMusicService;

  constructor() {
    this.server = new Server(
      {
        name: "game-mcp-server",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 初始化服务
    this.imageService = new ImageGenerationService();
    this.mongoService = new MongoDBService();
    this.dialogueService = new GameDialogueService();
    this.musicService = new GameMusicService();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // 列出所有可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // 图片生成工具
          {
            name: "generate_game_image",
            description: "使用Gemini 2.0 Flash生成游戏图片",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "图片生成提示词",
                },
                style: {
                  type: "string",
                  description: "图片风格 (pixel_art, realistic, cartoon, anime等)",
                  default: "pixel_art",
                },
                size: {
                  type: "string",
                  description: "图片尺寸 (256x256, 512x512, 1024x1024)",
                  default: "512x512",
                },
              },
              required: ["prompt"],
            },
          },
          
          // MongoDB数据库操作工具
          {
            name: "mongodb_insert",
            description: "向MongoDB数据库插入单条或多条记录",
            inputSchema: {
              type: "object",
              properties: {
                collection: {
                  type: "string",
                  description: "集合名称",
                },
                data: {
                  type: "object",
                  description: "要插入的数据（对象或对象数组）",
                },
              },
              required: ["collection", "data"],
            },
          },
          {
            name: "mongodb_find",
            description: "从MongoDB数据库查询记录",
            inputSchema: {
              type: "object",
              properties: {
                collection: {
                  type: "string",
                  description: "集合名称",
                },
                query: {
                  type: "object",
                  description: "查询条件",
                  default: {},
                },
                limit: {
                  type: "number",
                  description: "限制返回数量",
                  default: 10,
                },
                sort: {
                  type: "object",
                  description: "排序条件",
                  default: {},
                },
              },
              required: ["collection"],
            },
          },
          {
            name: "mongodb_find_one",
            description: "从MongoDB数据库查询单条记录",
            inputSchema: {
              type: "object",
              properties: {
                collection: {
                  type: "string",
                  description: "集合名称",
                },
                query: {
                  type: "object",
                  description: "查询条件",
                },
              },
              required: ["collection", "query"],
            },
          },
          {
            name: "mongodb_update",
            description: "更新MongoDB数据库记录",
            inputSchema: {
              type: "object",
              properties: {
                collection: {
                  type: "string",
                  description: "集合名称",
                },
                query: {
                  type: "object",
                  description: "查询条件",
                },
                update: {
                  type: "object",
                  description: "更新数据",
                },
                upsert: {
                  type: "boolean",
                  description: "如果不存在是否插入",
                  default: false,
                },
              },
              required: ["collection", "query", "update"],
            },
          },
          {
            name: "mongodb_delete",
            description: "从MongoDB数据库删除记录",
            inputSchema: {
              type: "object",
              properties: {
                collection: {
                  type: "string",
                  description: "集合名称",
                },
                query: {
                  type: "object",
                  description: "删除条件",
                },
                deleteMany: {
                  type: "boolean",
                  description: "是否删除多条记录",
                  default: false,
                },
              },
              required: ["collection", "query"],
            },
          },

          // 对话音效生成工具
          {
            name: "generate_dialogue_audio",
            description: "使用Google Cloud Text-to-Speech API生成游戏对话音效，支持NPC对话、角色配音、系统提示",
            inputSchema: {
              type: "object",
              properties: {
                text: {
                  type: "string",
                  description: "要转换为语音的文本内容",
                },
                character: {
                  type: "string",
                  description: "角色类型 (warrior, mage, rogue, merchant, guard, princess, villain, narrator, default)",
                  default: "default",
                },
                emotion: {
                  type: "string",
                  description: "情感表达 (neutral, happy, sad, angry, excited, calm, serious)",
                  default: "neutral",
                },
                language: {
                  type: "string",
                  description: "语言 (zh-CN, en-US, ja-JP, ko-KR)",
                  default: "zh-CN",
                },
                gender: {
                  type: "string",
                  description: "声音性别 (male, female, neutral)",
                  default: "neutral",
                },
                speed: {
                  type: "number",
                  description: "语速 (0.25-4.0)",
                  default: 1.0,
                },
                pitch: {
                  type: "number",
                  description: "音调 (-20到20)",
                  default: 0,
                },
              },
              required: ["text"],
            },
          },

          // 背景音乐生成工具
          {
            name: "generate_game_music",
            description: "使用Lyria API生成游戏背景音乐，支持主题音乐、环境音乐、战斗音乐等",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "音乐生成提示词，描述想要的音乐效果",
                },
                musicType: {
                  type: "string",
                  description: "音乐类型 (theme, battle, exploration, ambient, victory, defeat, cutscene, menu)",
                },
                genre: {
                  type: "string",
                  description: "音乐风格 (orchestral, electronic, rock, folk, ambient, jazz, medieval, cinematic)",
                  default: "orchestral",
                },
                mood: {
                  type: "string",
                  description: "音乐情绪 (epic, mysterious, peaceful, intense, melancholic, joyful, dark, heroic, romantic, suspenseful)",
                  default: "neutral",
                },
                duration: {
                  type: "number",
                  description: "音乐时长（秒，5-300）",
                  default: 30,
                },
                tempo: {
                  type: "string",
                  description: "节拍速度 (slow, medium, fast, very_fast)",
                  default: "medium",
                },
                instruments: {
                  type: "array",
                  description: "指定乐器列表（可选）",
                  items: {
                    type: "string",
                  },
                  default: [],
                },
                isLooping: {
                  type: "boolean",
                  description: "是否支持循环播放",
                  default: false,
                },
              },
              required: ["prompt", "musicType"],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "generate_game_image":
            const imageResult = await this.imageService.generateImage(args as any);
            return {
              content: imageResult.content,
            };

          case "mongodb_insert":
            const insertResult = await this.mongoService.insert(args as any);
            return {
              content: insertResult.content,
            };

          case "mongodb_find":
            const findResult = await this.mongoService.find(args as any);
            return {
              content: findResult.content,
            };

          case "mongodb_find_one":
            const findOneResult = await this.mongoService.findOne(args as any);
            return {
              content: findOneResult.content,
            };

          case "mongodb_update":
            const updateResult = await this.mongoService.update(args as any);
            return {
              content: updateResult.content,
            };

          case "mongodb_delete":
            const deleteResult = await this.mongoService.delete(args as any);
            return {
              content: deleteResult.content,
            };

          case "generate_dialogue_audio":
            const dialogueResult = await this.dialogueService.generateDialogue(args as any);
            return {
              content: dialogueResult.content,
            };

          case "generate_game_music":
            const musicResult = await this.musicService.generateMusic(args as any);
            return {
              content: musicResult.content,
            };

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `未知的工具: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `工具执行错误: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("游戏MCP服务器已启动 🎮🎭🎼");
    console.error("✅ 图片生成服务 (Gemini 2.0 Flash)");
    console.error("✅ 对话音效服务 (Google Cloud Text-to-Speech)");
    console.error("✅ 背景音乐服务 (Lyria API)");
    console.error("✅ MongoDB数据库服务");
  }
}

// 启动服务器
const server = new GameMCPServer();
server.run().catch(console.error); 
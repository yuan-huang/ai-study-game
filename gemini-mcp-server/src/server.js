#!/usr/bin/env node

// server.js - 使用最新MCP SDK API的Gemini服务
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载.env文件（明确指定路径）
const envPath = path.resolve(__dirname, '..', '.env');
console.error(`尝试加载环境文件: ${envPath}`);
const result = config({ path: envPath });

if (result.error) {
  console.error('加载.env文件失败:', result.error.message);
} else {
  console.error('成功加载.env文件');
}

// 调试：显示环境变量状态
console.error(`GEMINI_API_KEY 是否存在: ${!!process.env.GEMINI_API_KEY}`);
if (process.env.GEMINI_API_KEY) {
  console.error(`API密钥长度: ${process.env.GEMINI_API_KEY.length}`);
  console.error(`API密钥前缀: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
}

// 检查环境变量
if (!process.env.GEMINI_API_KEY) {
  console.error('错误: 请在.env文件中设置 GEMINI_API_KEY');
  console.error('示例: GEMINI_API_KEY=your_api_key_here');
  console.error(`当前工作目录: ${process.cwd()}`);
  console.error(`查找.env文件位置: ${envPath}`);
  process.exit(1);
}

// 初始化Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 创建MCP服务器
const server = new McpServer({
  name: 'gemini-image-generator',
  version: '1.0.0',
});

// 添加图片生成工具
server.tool(
  'generate_image',
  {
    prompt: z.string().describe('图片生成的文本描述'),
    style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract']).optional().default('realistic').describe('图片风格'),
    aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional().default('1:1').describe('图片比例'),
  },
  async ({ prompt, style = 'realistic', aspectRatio = '1:1' }) => {
    try {
      console.error(`生成图片请求: ${prompt}, 风格: ${style}, 比例: ${aspectRatio}`);

      // 使用Gemini 2.0 Flash模型
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-preview-image-generation",
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
        },
      });

      // 构建详细的图片生成提示
      const imagePrompt = `Create a detailed visual description for generating an image with the following specifications:

Description: ${prompt}
Style: ${style} 
Aspect Ratio: ${aspectRatio}

Please provide an extremely detailed description that includes:
1. Main subject and composition
2. Visual style and artistic approach (${style})
3. Color palette and lighting
4. Background and environment details
5. Technical specifications for ${aspectRatio} aspect ratio
6. Mood and atmosphere

Format the response as a comprehensive image generation prompt that could be used by AI image generators like DALL-E, Midjourney, or Stable Diffusion.`;

      const result = await model.generateContent(imagePrompt);
      const response = await result.response;
      const generatedDescription = response.text();

      return {
        content: [
          {
            type: 'text',
            text: `🎨 **图片生成描述已创建**

**原始提示**: ${prompt}
**风格**: ${style}
**比例**: ${aspectRatio}

**详细生成描述**:
${generatedDescription}

---
*注意: 由于Gemini API本身不直接生成图片，这里提供的是详细的图片描述，可以用于其他图片生成服务。*`,
          }
        ],
      };
    } catch (error) {
      console.error('图片生成错误:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ 图片生成失败: ${error.message}`,
          }
        ],
        isError: true,
      };
    }
  }
);

// 添加文本生成工具
server.tool(
  'generate_text',
  {
    prompt: z.string().describe('文本生成的提示'),
    maxTokens: z.number().optional().default(1000).describe('最大生成token数'),
    temperature: z.number().min(0).max(2).optional().default(0.7).describe('创造性程度 (0-2)'),
  },
  async ({ prompt, maxTokens = 1000, temperature = 0.7 }) => {
    try {
      console.error(`文本生成请求: ${prompt.substring(0, 100)}...`);

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
          topP: 0.95,
          topK: 64,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      return {
        content: [
          {
            type: 'text',
            text: generatedText,
          }
        ],
      };
    } catch (error) {
      console.error('文本生成错误:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ 文本生成失败: ${error.message}`,
          }
        ],
        isError: true,
      };
    }
  }
);

// 添加创意写作工具
server.tool(
  'creative_writing',
  {
    topic: z.string().describe('写作主题'),
    type: z.enum(['story', 'poem', 'article', 'script', 'letter']).describe('写作类型'),
    style: z.string().optional().describe('写作风格'),
    length: z.enum(['short', 'medium', 'long']).optional().default('medium').describe('文章长度'),
  },
  async ({ topic, type, style, length = 'medium' }) => {
    try {
      console.error(`创意写作请求: ${type} - ${topic}`);

      const lengthMap = {
        short: '简短 (100-300字)',
        medium: '中等 (300-800字)', 
        long: '长篇 (800-1500字)'
      };

      let promptTemplate = '';
      switch (type) {
        case 'story':
          promptTemplate = `创作一个关于"${topic}"的故事`;
          break;
        case 'poem':
          promptTemplate = `创作一首关于"${topic}"的诗歌`;
          break;
        case 'article':
          promptTemplate = `写一篇关于"${topic}"的文章`;
          break;
        case 'script':
          promptTemplate = `创作一个关于"${topic}"的剧本片段`;
          break;
        case 'letter':
          promptTemplate = `写一封关于"${topic}"的信件`;
          break;
      }

      const fullPrompt = `${promptTemplate}，长度要求：${lengthMap[length]}${style ? `，风格：${style}` : ''}。请确保内容原创、有趣且引人入胜。`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          maxOutputTokens: length === 'long' ? 2000 : length === 'medium' ? 1200 : 800,
          temperature: 0.8,
          topP: 0.95,
          topK: 64,
        },
      });

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const creativeText = response.text();

      return {
        content: [
          {
            type: 'text',
            text: `✍️ **${type === 'story' ? '故事' : type === 'poem' ? '诗歌' : type === 'article' ? '文章' : type === 'script' ? '剧本' : '信件'}创作完成**

**主题**: ${topic}
**类型**: ${type}
**长度**: ${length}
${style ? `**风格**: ${style}` : ''}

---

${creativeText}`,
          }
        ],
      };
    } catch (error) {
      console.error('创意写作错误:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ 创意写作失败: ${error.message}`,
          }
        ],
        isError: true,
      };
    }
  }
);

// 添加提示模板
server.prompt(
  'image_generation_guide',
  {
    subject: z.string().describe('图片主题'),
  },
  ({ subject }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `请帮我生成一个关于"${subject}"的详细图片描述。请使用generate_image工具，并提供以下信息：
1. 具体的视觉描述
2. 建议的艺术风格
3. 合适的颜色搭配
4. 构图建议`,
        },
      },
    ],
  })
);

// 启动服务器
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('🚀 Gemini MCP服务已启动，等待连接...');
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 服务运行错误:', error);
  process.exit(1);
});
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ImageGenerationParams {
  prompt: string;
  style?: string;
  size?: string;
}

export interface ImageGenerationResult {
  content: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
}

export class ImageGenerationService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY环境变量未设置");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
    try {
      const { prompt, style = "pixel_art", size = "512x512" } = params;

      // 构建完整的提示词，包含风格和尺寸信息
      const fullPrompt = `Generate a ${style} style game image: ${prompt}. Image size should be ${size}. Make it suitable for a game interface.`;

      // 使用Gemini 2.0 Flash模型生成图片
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
        },
      });

      const result = await model.generateContent([
        {
          text: fullPrompt + " Please generate an image based on this description."
        }
      ]);

      const response = await result.response;
      const text = response.text();

      // 注意：实际的图片生成可能需要不同的API调用方式
      // 这里提供一个基础实现，你需要根据实际的Gemini 2.0 Flash API文档调整
      
      return {
        content: [
          {
            type: "text",
            text: `图片生成请求已处理。提示词: ${fullPrompt}`,
          },
          {
            type: "text", 
            text: `生成结果: ${text}`,
          },
          {
            type: "text",
            text: `注意：请根据实际的Gemini 2.0 Flash Image Generation API文档更新此实现。当前为基础文本响应版本。`
          }
        ],
      };
    } catch (error) {
      console.error("图片生成错误:", error);
      return {
        content: [
          {
            type: "text",
            text: `图片生成失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  // 验证图片参数
  private validateParams(params: ImageGenerationParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("图片提示词不能为空");
    }

    const validStyles = ["pixel_art", "realistic", "cartoon", "anime", "watercolor", "oil_painting"];
    if (params.style && !validStyles.includes(params.style)) {
      throw new Error(`不支持的图片风格: ${params.style}. 支持的风格: ${validStyles.join(", ")}`);
    }

    const validSizes = ["256x256", "512x512", "1024x1024", "768x768"];
    if (params.size && !validSizes.includes(params.size)) {
      throw new Error(`不支持的图片尺寸: ${params.size}. 支持的尺寸: ${validSizes.join(", ")}`);
    }
  }

  // 获取支持的风格列表
  getSupportedStyles(): string[] {
    return ["pixel_art", "realistic", "cartoon", "anime", "watercolor", "oil_painting"];
  }

  // 获取支持的尺寸列表
  getSupportedSizes(): string[] {
    return ["256x256", "512x512", "1024x1024", "768x768"];
  }
} 
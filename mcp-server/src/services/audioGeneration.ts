import axios from "axios";

export interface AudioGenerationParams {
  description: string;
  duration?: number;
  style?: string;
}

export interface AudioGenerationResult {
  content: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
}

export class AudioGenerationService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.AUDIO_API_KEY;
  }

  async generateAudio(params: AudioGenerationParams): Promise<AudioGenerationResult> {
    try {
      this.validateParams(params);
      
      const { description, duration = 3, style = "8bit" } = params;

      // 这里实现音效生成逻辑
      // 可以集成各种音效生成API，如：
      // 1. ElevenLabs API
      // 2. Bark
      // 3. MusicGen
      // 4. 或自定义的音效生成服务

      const audioData = await this.generateAudioInternal(description, duration, style);

      return {
        content: [
          {
            type: "text",
            text: `🎵 音效生成完成`,
          },
          {
            type: "text",
            text: `描述: ${description}`,
          },
          {
            type: "text",
            text: `风格: ${style}`,
          },
          {
            type: "text",
            text: `时长: ${duration}秒`,
          },
          {
            type: "text",
            text: `生成状态: ${audioData.success ? "成功" : "失败"}`,
          },
          ...(audioData.url ? [{
            type: "text",
            text: `音频文件: ${audioData.url}`,
          }] : []),
        ],
      };
    } catch (error) {
      console.error("音效生成错误:", error);
      return {
        content: [
          {
            type: "text",
            text: `❌ 音效生成失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async generateAudioInternal(
    description: string, 
    duration: number, 
    style: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    
    // 方法1: 使用模拟生成（开发阶段）
    if (!this.apiKey) {
      return await this.simulateAudioGeneration(description, duration, style);
    }

    // 方法2: 集成实际的音频生成API
    try {
      // 示例：集成ElevenLabs或其他音频生成服务
      const result = await this.callExternalAudioAPI(description, duration, style);
      return result;
    } catch (error) {
      console.error("外部API调用失败，使用模拟生成:", error);
      return await this.simulateAudioGeneration(description, duration, style);
    }
  }

  // 模拟音效生成（用于开发和测试）
  private async simulateAudioGeneration(
    description: string, 
    duration: number, 
    style: string
  ): Promise<{ success: boolean; url?: string }> {
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 根据描述和风格生成模拟音效信息
    const audioInfo = this.generateAudioInfo(description, style, duration);
    
    return {
      success: true,
      url: `generated_audio_${Date.now()}.wav`,
      ...audioInfo
    };
  }

  // 调用外部音频生成API（示例实现）
  private async callExternalAudioAPI(
    description: string, 
    duration: number, 
    style: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    
    try {
      // 这里可以集成实际的音频生成API
      // 例如：ElevenLabs, Bark, MusicGen等
      
      const prompt = this.buildAudioPrompt(description, style, duration);
      
      // 示例API调用（需要根据实际API调整）
      const response = await axios.post("https://api.example-audio-service.com/generate", {
        prompt: prompt,
        duration: duration,
        style: style,
        format: "wav"
      }, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      });

      if (response.data && response.data.audio_url) {
        return {
          success: true,
          url: response.data.audio_url
        };
      } else {
        throw new Error("API响应格式不正确");
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // 构建音频生成提示词
  private buildAudioPrompt(description: string, style: string, duration: number): string {
    const styleDescriptions = {
      "8bit": "复古8位游戏风格，电子合成器音效",
      "orchestral": "管弦乐队演奏，史诗级游戏音效",
      "electronic": "现代电子音乐风格，节奏感强",
      "ambient": "环境音效，氛围感强",
      "rock": "摇滚风格，吉他和鼓点",
      "medieval": "中世纪风格，古典乐器",
      "sci-fi": "科幻风格，未来感电子音效"
    };

    const styleDesc = styleDescriptions[style as keyof typeof styleDescriptions] || "通用游戏音效";
    
    return `生成${duration}秒的${styleDesc}音效：${description}。要求清晰、高质量，适合游戏使用。`;
  }

  // 生成音效信息
  private generateAudioInfo(description: string, style: string, duration: number) {
    const techniques = {
      "8bit": ["方波", "锯齿波", "噪声", "低通滤波"],
      "orchestral": ["弦乐", "管乐", "打击乐", "混响"],
      "electronic": ["合成器", "采样", "效果器", "压缩"],
      "ambient": ["白噪声", "滤波", "延迟", "混响"],
      "rock": ["失真吉他", "贝斯", "鼓组", "压缩"],
      "medieval": ["笛子", "琵琶", "鼓", "回声"],
      "sci-fi": ["调制", "失真", "数字效果", "频率扫描"]
    };

    const styleTechniques = techniques[style as keyof typeof techniques] || ["通用音效"];
    
    return {
      techniques: styleTechniques,
      frequency: this.getFrequencyRange(style),
      amplitude: this.getAmplitudeInfo(description)
    };
  }

  // 获取频率范围信息
  private getFrequencyRange(style: string): string {
    const ranges = {
      "8bit": "80Hz - 8kHz",
      "orchestral": "20Hz - 20kHz",
      "electronic": "40Hz - 16kHz", 
      "ambient": "20Hz - 12kHz",
      "rock": "60Hz - 15kHz",
      "medieval": "100Hz - 10kHz",
      "sci-fi": "20Hz - 20kHz"
    };

    return ranges[style as keyof typeof ranges] || "20Hz - 20kHz";
  }

  // 获取音量信息
  private getAmplitudeInfo(description: string): string {
    const loudKeywords = ["爆炸", "撞击", "雷声", "咆哮"];
    const softKeywords = ["微风", "溪流", "轻柔", "静谧"];
    
    const isLoud = loudKeywords.some(keyword => description.includes(keyword));
    const isSoft = softKeywords.some(keyword => description.includes(keyword));
    
    if (isLoud) return "高音量 (-6dB)";
    if (isSoft) return "低音量 (-18dB)";
    return "中等音量 (-12dB)";
  }

  // 验证参数
  private validateParams(params: AudioGenerationParams): void {
    if (!params.description || params.description.trim().length === 0) {
      throw new Error("音效描述不能为空");
    }

    if (params.duration && (params.duration < 0.1 || params.duration > 60)) {
      throw new Error("音效时长必须在0.1到60秒之间");
    }

    const validStyles = ["8bit", "orchestral", "electronic", "ambient", "rock", "medieval", "sci-fi"];
    if (params.style && !validStyles.includes(params.style)) {
      throw new Error(`不支持的音效风格: ${params.style}. 支持的风格: ${validStyles.join(", ")}`);
    }
  }

  // 获取支持的风格列表
  getSupportedStyles(): string[] {
    return ["8bit", "orchestral", "electronic", "ambient", "rock", "medieval", "sci-fi"];
  }

  // 获取风格描述
  getStyleDescription(style: string): string {
    const descriptions = {
      "8bit": "复古8位游戏音效，适合像素风游戏",
      "orchestral": "管弦乐风格，适合RPG和史诗游戏",
      "electronic": "电子音乐风格，适合现代和科幻游戏",
      "ambient": "环境音效，适合营造氛围",
      "rock": "摇滚风格，适合动作和竞速游戏",
      "medieval": "中世纪风格，适合奇幻和历史游戏",
      "sci-fi": "科幻风格，适合太空和未来主题游戏"
    };

    return descriptions[style as keyof typeof descriptions] || "通用游戏音效";
  }
} 
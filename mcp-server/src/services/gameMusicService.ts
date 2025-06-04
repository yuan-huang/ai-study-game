export interface MusicGenerationParams {
  prompt: string;
  musicType: string;
  genre?: string;
  mood?: string;
  duration?: number;
  tempo?: string;
  instruments?: string[];
  isLooping?: boolean;
}

export interface MusicGenerationResult {
  content: Array<{
    type: string;
    text?: string;
    audioUrl?: string;
    duration?: number;
    musicMetadata?: any;
  }>;
}

export class GameMusicService {
  private apiKey: string | undefined;

  constructor() {
    // 暂时使用环境变量，等待Lyria API正式发布
    this.apiKey = process.env.LYRIA_API_KEY || process.env.GOOGLE_AI_API_KEY;
  }

  async generateMusic(params: MusicGenerationParams): Promise<MusicGenerationResult> {
    try {
      this.validateParams(params);
      
      const { 
        prompt, 
        musicType, 
        genre = "orchestral", 
        mood = "neutral", 
        duration = 30, 
        tempo = "medium",
        instruments = [],
        isLooping = false 
      } = params;

      // 生成音乐
      const musicData = await this.generateMusicInternal(prompt, musicType, genre, mood, duration, tempo, instruments, isLooping);

      return {
        content: [
          {
            type: "text",
            text: `🎼 背景音乐生成完成`,
          },
          {
            type: "text",
            text: `类型：${this.getMusicTypeDescription(musicType)}`,
          },
          {
            type: "text",
            text: `风格：${genre}`,
          },
          {
            type: "text",
            text: `情绪：${mood}`,
          },
          {
            type: "text",
            text: `时长：${duration}秒`,
          },
          {
            type: "text",
            text: `节拍：${tempo}`,
          },
          {
            type: "text",
            text: `循环播放：${isLooping ? "是" : "否"}`,
          },
          {
            type: "text",
            text: `乐器：${instruments.length > 0 ? instruments.join(", ") : "自动选择"}`,
          },
          {
            type: "text",
            text: `提示词：${prompt}`,
          },
          {
            type: "text",
            text: `生成状态：${musicData.success ? "成功" : "失败"}`,
          },
          ...(musicData.audioUrl ? [{
            type: "text",
            text: `音乐文件：${musicData.audioUrl}`,
            audioUrl: musicData.audioUrl,
            duration: duration,
            musicMetadata: musicData.metadata,
          }] : []),
        ],
      };
    } catch (error) {
      console.error("背景音乐生成错误:", error);
      return {
        content: [
          {
            type: "text",
            text: `❌ 背景音乐生成失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async generateMusicInternal(
    prompt: string,
    musicType: string,
    genre: string,
    mood: string,
    duration: number,
    tempo: string,
    instruments: string[],
    isLooping: boolean
  ): Promise<{ success: boolean; audioUrl?: string; metadata?: any; error?: string }> {
    
    // 如果没有API密钥，使用模拟生成
    if (!this.apiKey) {
      return await this.simulateMusicGeneration(prompt, musicType, genre, mood, duration, tempo, instruments, isLooping);
    }

    try {
      // 未来集成Lyria API的地方
      const result = await this.callLyriaAPI(prompt, musicType, genre, mood, duration, tempo, instruments, isLooping);
      return result;
    } catch (error) {
      console.error("Lyria API调用失败，使用模拟生成:", error);
      return await this.simulateMusicGeneration(prompt, musicType, genre, mood, duration, tempo, instruments, isLooping);
    }
  }

  // 模拟音乐生成（用于开发和测试）
  private async simulateMusicGeneration(
    prompt: string,
    musicType: string,
    genre: string,
    mood: string,
    duration: number,
    tempo: string,
    instruments: string[],
    isLooping: boolean
  ): Promise<{ success: boolean; audioUrl?: string; metadata?: any }> {
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 生成音乐文件信息
    const musicInfo = this.generateMusicInfo(prompt, musicType, genre, mood, duration, tempo, instruments, isLooping);
    
    const audioFileName = `music_${musicType}_${Date.now()}.mp3`;
    const audioPath = `./generated_music/${audioFileName}`;

    return {
      success: true,
      audioUrl: audioPath,
      metadata: musicInfo
    };
  }

  // 未来集成Lyria API
  private async callLyriaAPI(
    prompt: string,
    musicType: string,
    genre: string,
    mood: string,
    duration: number,
    tempo: string,
    instruments: string[],
    isLooping: boolean
  ): Promise<{ success: boolean; audioUrl?: string; metadata?: any; error?: string }> {
    
    try {
      // 构建完整的音乐生成提示
      const fullPrompt = this.buildMusicPrompt(prompt, musicType, genre, mood, duration, tempo, instruments, isLooping);
      
      // 这里将来集成实际的Lyria API调用
      // 示例API调用结构（需要根据实际API调整）
      /*
      const response = await fetch("https://api.lyria.google.com/v1/generate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          duration: duration,
          format: "mp3",
          quality: "high"
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          audioUrl: data.audio_url,
          metadata: data.metadata
        };
      } else {
        throw new Error(`API响应错误: ${response.status}`);
      }
      */

      // 暂时返回模拟结果
      throw new Error("Lyria API尚未正式发布");
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // 构建音乐生成提示词
  private buildMusicPrompt(
    prompt: string,
    musicType: string,
    genre: string,
    mood: string,
    duration: number,
    tempo: string,
    instruments: string[],
    isLooping: boolean
  ): string {
    const typeDescriptions = {
      "theme": "主题音乐，代表游戏的核心精神",
      "battle": "战斗音乐，激烈紧张的战斗氛围",
      "exploration": "探索音乐，神秘冒险的环境氛围",
      "ambient": "环境音乐，背景氛围音效",
      "victory": "胜利音乐，庆祝和triumph的感觉",
      "defeat": "失败音乐，挫折和悲伤的情绪",
      "cutscene": "过场音乐，叙事性的配乐",
      "menu": "菜单音乐，轻松简洁的界面音乐"
    };

    const moodDescriptions = {
      "epic": "史诗般壮阔",
      "mysterious": "神秘诡异",
      "peaceful": "宁静祥和",
      "intense": "紧张激烈",
      "melancholic": "忧郁深沉",
      "joyful": "欢快愉悦",
      "dark": "黑暗阴郁",
      "heroic": "英雄气概",
      "romantic": "浪漫柔情",
      "suspenseful": "悬疑紧张"
    };

    const typeDesc = typeDescriptions[musicType as keyof typeof typeDescriptions] || "通用游戏音乐";
    const moodDesc = moodDescriptions[mood as keyof typeof moodDescriptions] || mood;

    let fullPrompt = `创作${duration}秒的${typeDesc}，风格为${genre}，情绪${moodDesc}，节拍${tempo}。`;
    fullPrompt += `具体要求：${prompt}。`;
    
    if (instruments.length > 0) {
      fullPrompt += `主要乐器：${instruments.join(", ")}。`;
    }
    
    if (isLooping) {
      fullPrompt += `音乐需要支持无缝循环播放。`;
    }

    fullPrompt += `适合游戏使用，高质量输出。`;

    return fullPrompt;
  }

  // 生成音乐信息
  private generateMusicInfo(
    prompt: string,
    musicType: string,
    genre: string,
    mood: string,
    duration: number,
    tempo: string,
    instruments: string[],
    isLooping: boolean
  ) {
    const keySignatures = ["C Major", "G Major", "D Major", "A Major", "E Major", "F Major", "Bb Major", "Eb Major"];
    const timeSignatures = ["4/4", "3/4", "2/4", "6/8"];
    
    const tempoMappings = {
      "slow": { bpm: "60-80", description: "慢板" },
      "medium": { bpm: "90-120", description: "中板" },
      "fast": { bpm: "130-160", description: "快板" },
      "very_fast": { bpm: "170-200", description: "急板" }
    };

    const selectedKey = keySignatures[Math.floor(Math.random() * keySignatures.length)];
    const selectedTimeSignature = timeSignatures[Math.floor(Math.random() * timeSignatures.length)];
    const tempoInfo = tempoMappings[tempo as keyof typeof tempoMappings] || tempoMappings["medium"];

    return {
      musicType,
      genre,
      mood,
      duration,
      key: selectedKey,
      timeSignature: selectedTimeSignature,
      tempo: tempoInfo,
      instruments: instruments.length > 0 ? instruments : this.getDefaultInstruments(genre),
      isLooping,
      structure: this.generateMusicStructure(musicType, duration),
      tags: this.generateMusicTags(musicType, genre, mood)
    };
  }

  // 获取默认乐器配置
  private getDefaultInstruments(genre: string): string[] {
    const instrumentMap: Record<string, string[]> = {
      "orchestral": ["小提琴", "大提琴", "长笛", "圆号", "定音鼓"],
      "electronic": ["合成器", "电子鼓", "低音合成器", "数字钢琴"],
      "rock": ["电吉他", "贝斯", "架子鼓", "电子琴"],
      "folk": ["木吉他", "小提琴", "笛子", "手鼓"],
      "ambient": ["合成垫音", "环境音效", "钢琴", "弦乐"],
      "jazz": ["萨克斯", "钢琴", "低音贝斯", "爵士鼓"],
      "medieval": ["琵琶", "笛子", "鼓", "竖琴"],
      "cinematic": ["管弦乐团", "合唱", "打击乐", "铜管"]
    };

    return instrumentMap[genre] || ["钢琴", "弦乐", "打击乐"];
  }

  // 生成音乐结构
  private generateMusicStructure(musicType: string, duration: number) {
    const structures: Record<string, string[]> = {
      "theme": ["前奏", "主题A", "主题B", "发展", "再现", "尾声"],
      "battle": ["建立紧张", "第一波", "间歇", "高潮", "结束"],
      "exploration": ["引入", "层层递进", "发现", "神秘感", "开放结尾"],
      "ambient": ["缓慢建立", "持续氛围", "微妙变化", "自然消散"],
      "victory": ["庆祝开始", "主题展现", "高潮庆祝", "凯旋结束"],
      "menu": ["简单循环", "变奏1", "变奏2", "回到主题"]
    };

    return structures[musicType] || ["开始", "发展", "结束"];
  }

  // 生成音乐标签
  private generateMusicTags(musicType: string, genre: string, mood: string): string[] {
    const baseTags = [musicType, genre, mood, "游戏音乐", "原创"];
    
    const additionalTags: Record<string, string[]> = {
      "battle": ["战斗", "紧张", "动作"],
      "exploration": ["冒险", "神秘", "发现"],
      "theme": ["主题", "代表性", "标志性"],
      "ambient": ["氛围", "背景", "环境"],
      "victory": ["胜利", "庆祝", "triumph"],
      "orchestral": ["交响乐", "古典", "管弦"],
      "electronic": ["电子", "现代", "合成"],
      "epic": ["史诗", "宏大", "壮阔"],
      "peaceful": ["宁静", "平和", "舒缓"]
    };

    const extraTags = [
      ...(additionalTags[musicType] || []),
      ...(additionalTags[genre] || []),
      ...(additionalTags[mood] || [])
    ];

    return [...baseTags, ...extraTags];
  }

  // 验证参数
  private validateParams(params: MusicGenerationParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("音乐提示词不能为空");
    }

    if (!params.musicType) {
      throw new Error("音乐类型不能为空");
    }

    if (params.duration && (params.duration < 5 || params.duration > 300)) {
      throw new Error("音乐时长必须在5到300秒之间");
    }

    const validTypes = ["theme", "battle", "exploration", "ambient", "victory", "defeat", "cutscene", "menu"];
    if (!validTypes.includes(params.musicType)) {
      throw new Error(`不支持的音乐类型: ${params.musicType}. 支持的类型: ${validTypes.join(", ")}`);
    }

    const validGenres = ["orchestral", "electronic", "rock", "folk", "ambient", "jazz", "medieval", "cinematic"];
    if (params.genre && !validGenres.includes(params.genre)) {
      throw new Error(`不支持的音乐风格: ${params.genre}. 支持的风格: ${validGenres.join(", ")}`);
    }

    const validMoods = ["epic", "mysterious", "peaceful", "intense", "melancholic", "joyful", "dark", "heroic", "romantic", "suspenseful"];
    if (params.mood && !validMoods.includes(params.mood)) {
      throw new Error(`不支持的情绪: ${params.mood}. 支持的情绪: ${validMoods.join(", ")}`);
    }

    const validTempos = ["slow", "medium", "fast", "very_fast"];
    if (params.tempo && !validTempos.includes(params.tempo)) {
      throw new Error(`不支持的节拍: ${params.tempo}. 支持的节拍: ${validTempos.join(", ")}`);
    }
  }

  // 获取支持的音乐类型
  getSupportedMusicTypes(): string[] {
    return ["theme", "battle", "exploration", "ambient", "victory", "defeat", "cutscene", "menu"];
  }

  // 获取支持的音乐风格
  getSupportedGenres(): string[] {
    return ["orchestral", "electronic", "rock", "folk", "ambient", "jazz", "medieval", "cinematic"];
  }

  // 获取支持的情绪
  getSupportedMoods(): string[] {
    return ["epic", "mysterious", "peaceful", "intense", "melancholic", "joyful", "dark", "heroic", "romantic", "suspenseful"];
  }

  // 获取音乐类型描述
  getMusicTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      "theme": "主题音乐 - 代表游戏核心精神的标志性音乐",
      "battle": "战斗音乐 - 激烈紧张的战斗场面配乐",
      "exploration": "探索音乐 - 冒险发现时的神秘氛围音乐",
      "ambient": "环境音乐 - 营造游戏世界氛围的背景音乐",
      "victory": "胜利音乐 - 庆祝成功和triumph的音乐",
      "defeat": "失败音乐 - 表达挫折和失败情绪的音乐",
      "cutscene": "过场音乐 - 叙事性场景的配乐",
      "menu": "菜单音乐 - 简洁轻松的界面音乐"
    };

    return descriptions[type] || "通用游戏音乐";
  }
} 
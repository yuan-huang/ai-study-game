/**
 * 字体管理器
 * 用于加载和管理阿里开源字体
 */
export class FontManager {
  private static instance: FontManager;
  private loadedFonts: Set<string> = new Set();

  static getInstance(): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager();
    }
    return FontManager.instance;
  }

  /**
   * 加载阿里巴巴普惠体
   */
  async loadAlibabaPuHuiTi(): Promise<void> {
    const fontName = 'Alibaba-PuHuiTi';
    
    if (this.loadedFonts.has(fontName)) {
      return;
    }

    try {
      // 尝试从GitHub加载字体文件
      const fontUrls = [
        'https://raw.githubusercontent.com/chinayin/fonts-alibaba-puhuiti-regular/master/Alibaba-PuHuiTi-Regular.ttf',
        // 备用CDN
        'https://puhuiti.oss-cn-hangzhou.aliyuncs.com/AlibabaPuHuiTi-3-45-Light.woff2',
        'https://puhuiti.oss-cn-hangzhou.aliyuncs.com/AlibabaPuHuiTi-3-55-Regular.woff2'
      ];

      for (const url of fontUrls) {
        try {
          await this.loadFontFromUrl(fontName, url);
          this.loadedFonts.add(fontName);
          console.log(`成功加载字体: ${fontName}`);
          return;
        } catch (error) {
          console.warn(`从 ${url} 加载字体失败，尝试下一个源...`);
        }
      }
      
      throw new Error('所有字体源都加载失败');
    } catch (error) {
      console.error('加载阿里巴巴普惠体失败:', error);
      // 降级到系统字体
      this.setFallbackFont();
    }
  }

  /**
   * 从URL加载字体
   */
  private async loadFontFromUrl(fontName: string, url: string): Promise<void> {
    const fontFace = new FontFace(fontName, `url(${url})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  }

  /**
   * 设置降级字体
   */
  private setFallbackFont(): void {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --font-alibaba: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 应用字体到CSS变量
   */
  applyFontsToCSS(): void {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --font-alibaba: "Alibaba-PuHuiTi", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        --font-code: "Fira Code", "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
      }
      
      .font-alibaba {
        font-family: var(--font-alibaba);
      }
      
      .font-code {
        font-family: var(--font-code);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 检查字体是否已加载
   */
  isFontLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName);
  }
}

// 自动初始化字体管理器
export const fontManager = FontManager.getInstance(); 
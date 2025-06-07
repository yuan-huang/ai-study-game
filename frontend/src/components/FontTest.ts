/**
 * 字体测试组件
 * 用于验证阿里开源字体是否正常加载
 */
export class FontTest {
  private container: HTMLElement;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body;
    this.createTestElements();
  }

  private createTestElements(): void {
    // 创建测试容器
    const testContainer = document.createElement('div');
    testContainer.id = 'font-test-container';
    testContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      max-width: 300px;
      font-family: var(--font-alibaba, 'Arial', sans-serif);
    `;

    // 测试文本
    const testTexts = [
      { text: '阿里巴巴普惠体测试', className: 'font-alibaba' },
      { text: 'Alibaba PuHuiTi Test', className: 'font-alibaba' },
      { text: 'console.log("Hello");', className: 'font-code' },
      { text: '123456789', className: 'font-alibaba' }
    ];

    const title = document.createElement('h3');
    title.textContent = '字体加载测试';
    title.style.cssText = 'margin: 0 0 10px 0; color: #4ade80;';
    testContainer.appendChild(title);

    testTexts.forEach(({ text, className }) => {
      const testElement = document.createElement('div');
      testElement.textContent = text;
      testElement.className = className;
      testElement.style.cssText = `
        margin: 8px 0;
        padding: 5px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      `;
      testContainer.appendChild(testElement);
    });

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.cssText = `
      margin-top: 10px;
      padding: 5px 10px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;
    closeButton.onclick = () => testContainer.remove();
    testContainer.appendChild(closeButton);

    this.container.appendChild(testContainer);

    // 3秒后自动关闭
    setTimeout(() => {
      if (testContainer.parentNode) {
        testContainer.remove();
      }
    }, 10000);
  }

  /**
   * 显示字体加载状态
   */
  static showFontStatus(fontName: string, isLoaded: boolean): void {
    const status = document.createElement('div');
    status.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: ${isLoaded ? '#10b981' : '#ef4444'};
      color: white;
      padding: 10px 15px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 9999;
      font-family: Arial, sans-serif;
    `;
    status.textContent = `${fontName}: ${isLoaded ? '✅ 已加载' : '❌ 加载失败'}`;
    
    document.body.appendChild(status);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (status.parentNode) {
        status.remove();
      }
    }, 3000);
  }
} 
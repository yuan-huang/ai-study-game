import { KnowledgeGarden } from './KnowledgeGarden';
import { fontManager } from './utils/fontManager';
import { FontTest } from './components/FontTest';
import { PhaserFontConfig } from './config/PhaserFontConfig';
import './index.css';

// 防止默认的拖拽、选择等行为
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.touchAction = 'manipulation';
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('dragstart', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => e.preventDefault());
});

// 等待DOM完全加载后初始化游戏
window.addEventListener('load', async () => {
    console.log('🌐 页面完全加载，开始初始化游戏');
    
    // 首先加载字体
    console.log('🔤 开始加载阿里开源字体...');
    try {
        // 1. 加载基础字体文件
        await fontManager.loadAlibabaPuHuiTi();
        fontManager.applyFontsToCSS();
        
        // 2. 初始化Phaser字体配置
        await PhaserFontConfig.initializeGameFonts();
        
        console.log('✅ 字体加载完成');
        

        
    } catch (error) {
        console.warn('⚠️ 字体加载失败，使用降级方案:', error);
        FontTest.showFontStatus('阿里巴巴普惠体', false);
        FontTest.showFontStatus('Phaser字体配置', false);
    }
    
    // 清理已存在的游戏容器
    const existingContainer = document.getElementById('game-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // 创建游戏容器
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.style.width = '100vw';
    gameContainer.style.height = '100vh';
    gameContainer.style.position = 'fixed';
    gameContainer.style.top = '0';
    gameContainer.style.left = '0';
    gameContainer.style.overflow = 'hidden';
    gameContainer.style.zIndex = '1';
    gameContainer.style.background = '#000';
    
    // 防止容器本身的事件干扰
    gameContainer.style.userSelect = 'none';
    gameContainer.style.webkitUserSelect = 'none';
    gameContainer.style.touchAction = 'none';
    
    document.body.appendChild(gameContainer);
    
    // 延迟初始化游戏，确保DOM稳定
    setTimeout(() => {
        console.log('⏰ 延迟初始化开始');
        
        try {
            // 启动游戏
            const game = new KnowledgeGarden('game-container');
            console.log('✅ 游戏创建成功');
            
            // 额外的延迟确保Phaser完全初始化
            setTimeout(() => {
                console.log('🎮 Phaser初始化完成，开始测试事件');
                
                // 测试Canvas是否正确创建
                const canvas = document.querySelector('#game-container canvas') as HTMLCanvasElement;
                if (canvas) {
                    console.log('🖼️ Canvas元素找到:', canvas);
                    
                    // 强制设置Canvas属性
                    canvas.style.display = 'block';
                    canvas.style.cursor = 'default';
                    canvas.style.touchAction = 'none';
                    canvas.tabIndex = 1; // 确保Canvas可以接收焦点
                    

                    // 强制聚焦到Canvas
                    canvas.focus();
                } else {
                    console.error('❌ 未找到Canvas元素');
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ 游戏创建失败:', error);
        }
    }, 500);
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
    console.log('📐 窗口大小变化');
    const container = document.getElementById('game-container');
    if (container) {
        container.style.width = `${window.innerWidth}px`;
        container.style.height = `${window.innerHeight}px`;
    }
}); 
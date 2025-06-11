import { KnowledgeGarden } from './KnowledgeGarden';
import { PhaserFontConfig } from './config/PhaserFontConfig';
import { AudioManager } from './utils/AudioManager';
import './index.css';
import './styles/curiousTress.css';

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
        // 初始化Phaser字体配置
        await PhaserFontConfig.initializeGameFonts();
        console.log('✅ 字体加载完成');
    } catch (error) {
        console.warn('⚠️ 字体加载失败，使用降级方案:', error);
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
            // 将游戏实例保存到全局变量，方便AudioManager访问
            (window as any).game = game;
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
                    
                    // 添加全局用户交互监听以恢复AudioContext
                    const setupAudioContextResume = () => {
                        const handleUserInteraction = async () => {
                            try {
                                const audioManager = AudioManager.getInstance();
                                const gameInstance = (window as any).game;
                                if (gameInstance && gameInstance.scene.scenes.length > 0) {
                                    const currentScene = gameInstance.scene.scenes[0];
                                    const resumed = await audioManager.resumeAudioContext(currentScene);
                                    if (resumed) {
                                        console.log('🎵 首次用户交互后AudioContext已恢复');
                                        // 移除监听器，因为只需要恢复一次
                                        document.removeEventListener('click', handleUserInteraction);
                                        document.removeEventListener('keydown', handleUserInteraction);
                                        document.removeEventListener('touchstart', handleUserInteraction);
                                    }
                                }
                            } catch (error) {
                                console.warn('⚠️ 恢复AudioContext时出错:', error);
                            }
                        };
                        
                        document.addEventListener('click', handleUserInteraction, { once: false });
                        document.addEventListener('keydown', handleUserInteraction, { once: false });
                        document.addEventListener('touchstart', handleUserInteraction, { once: false });
                        console.log('🎧 已设置全局AudioContext恢复监听器');
                    };
                    
                    setupAudioContextResume();
                    
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
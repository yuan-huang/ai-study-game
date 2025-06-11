import { KnowledgeGarden } from './KnowledgeGarden';
import { PhaserFontConfig } from './config/PhaserFontConfig';
import { AudioManager } from './utils/AudioManager';
import { LoadingManager } from './components/LoadingManager';
import './index.css';
import './styles/curiousTress.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Game } from './components/Game';

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

// 初始化加载管理器
let loadingManager: LoadingManager;

// 等待DOM完全加载后初始化游戏
window.addEventListener('load', async () => {
    console.log('🌐 页面完全加载，开始初始化游戏');
    
    // 初始化加载管理器
    loadingManager = LoadingManager.getInstance();
    console.log('🎬 LoadingManager已初始化');
    
    // 首先加载字体
    console.log('🔤 开始加载阿里开源字体...');
    try {
        await PhaserFontConfig.initializeGameFonts();
        console.log('✅ 字体加载完成');
    } catch (error) {
        console.warn('⚠️ 字体加载失败，使用降级方案:', error);
    }
    
    // 初始化Phaser游戏
    try {
        const game = new KnowledgeGarden('game-canvas');
        (window as any).game = game;
        console.log('✅ Phaser游戏创建成功');
    } catch (error) {
        console.error('❌ Phaser游戏创建失败:', error);
    }

    // 初始化React应用
    try {
        const appContainer = document.getElementById('game-app');
        if (appContainer) {
            const root = ReactDOM.createRoot(appContainer);
            root.render(
                <React.StrictMode>
                    <Game />
                </React.StrictMode>
            );
            console.log('✅ React应用创建成功');
        }
    } catch (error) {
        console.error('❌ React应用创建失败:', error);
    }
    
    // 游戏初始化完成，加载动画将由具体场景控制隐藏
    console.log('✅ 游戏初始化完成，等待场景控制加载动画');
    
    // 添加一个全局测试函数，可以手动隐藏加载动画
    (window as any).testHideLoading = () => {
        console.log('🧪 手动测试隐藏加载动画');
        const { hideLoading } = require('./components/LoadingManager');
        hideLoading(0);
    };
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
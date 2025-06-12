import React from 'react';
import ReactDOM from 'react-dom/client';
import { ManagerApp } from './pages/ManagerApp';
import './index.css';

// 防止默认的拖拽、选择等行为
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.userSelect = 'auto'; // 管理页面允许文本选择
    document.body.style.webkitUserSelect = 'auto';
    document.body.style.touchAction = 'auto';
    document.body.style.overflow = 'auto'; // 管理页面允许滚动
});

// 隐藏加载动画的工具函数
const hideLoading = (delay: number = 500) => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, delay);
};

// 等待DOM完全加载后初始化管理应用
window.addEventListener('load', async () => {
    console.log('🌐 管理页面完全加载，开始初始化应用');

    try {
        const appContainer = document.getElementById('manager-app');
        if (appContainer) {
            const root = ReactDOM.createRoot(appContainer);
            root.render(
                <React.StrictMode>
                    <ManagerApp />
                </React.StrictMode>
            );
            console.log('✅ 管理应用创建成功');

            // 应用加载完成后隐藏加载动画
            hideLoading(1000);
        }
    } catch (error) {
        console.error('❌ 管理应用创建失败:', error);
        hideLoading(0); // 出错时立即隐藏加载动画
    }
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
    // 管理页面通常不需要特殊的resize处理
    console.log('📐 管理页面窗口大小变化');
}); 
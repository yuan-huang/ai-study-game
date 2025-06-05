import { KnowledgeGarden } from './game/main';

// 创建游戏容器
const gameContainer = document.createElement('div');
gameContainer.id = 'game-container';
gameContainer.style.width = '100vw';
gameContainer.style.height = '100vh';
gameContainer.style.position = 'fixed';
gameContainer.style.top = '0';
gameContainer.style.left = '0';
gameContainer.style.overflow = 'hidden';
document.body.appendChild(gameContainer);

// 启动游戏
const game = new KnowledgeGarden('game-container');

// 处理窗口大小变化
window.addEventListener('resize', () => {
    if (game) {
        // 更新游戏容器大小
        const container = document.getElementById('game-container');
        if (container) {
            container.style.width = `${window.innerWidth}px`;
            container.style.height = `${window.innerHeight}px`;
        }
    }
}); 
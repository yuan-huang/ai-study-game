import React, { useEffect, useRef, useState } from 'react';
import { useUserStore } from '../../stores/userStore';

interface GameState {
  health: number;
  score: number;
  combo: number;
  wave: number;
  totalWaves: number;
  isPaused: boolean;
  speed: number;
}

const TowerDefense: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const user = useUserStore(state => state.user);
  const [gameState, setGameState] = useState<GameState>({
    health: 10,
    score: 100,
    combo: 0,
    wave: 1,
    totalWaves: 5,
    isPaused: false,
    speed: 1
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 这里将添加游戏初始化逻辑
    const initGame = () => {
      // TODO: 初始化游戏
    };

    initGame();

    return () => {
      // 清理游戏资源
    };
  }, []);

  return (
    <div className="game-container">
      {/* 左侧游戏区域 */}
      <div className="game-area">
        {/* 游戏状态栏 */}
        <div className="flex justify-between bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❤️</span>
              <span>生命值: {gameState.health}</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">💰</span>
              <span>积分: {gameState.score}</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-500 mr-2">⚡</span>
              <span>连击: {gameState.combo}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span>第{gameState.wave}波 / {gameState.totalWaves}波</span>
          </div>
        </div>

        {/* 游戏画布 */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="bg-gray-100 rounded-lg shadow"
          />
          
          {/* 控制按钮 */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {gameState.isPaused ? '继续' : '暂停'}
            </button>
            <button
              onClick={() => setGameState(prev => ({ ...prev, speed: prev.speed === 1 ? 2 : 1 }))}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {gameState.speed}x速度
            </button>
          </div>
        </div>
      </div>

      {/* 右侧UI区域 */}
      <div className="ui-area ml-4">
        {/* 答题区域 */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">回答问题获得积分</h3>
            <div className="text-sm text-gray-600">
              剩余时间: 30秒
            </div>
          </div>
          <div className="question-content">
            <p className="text-xl mb-4">5 + 3 = ?</p>
            <div className="grid grid-cols-2 gap-2">
              {[6, 7, 8, 9].map((answer) => (
                <button
                  key={answer}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded text-center"
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 建塔菜单 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">建造防御塔</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="tower-item p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
              <div className="text-center text-2xl mb-2">🏹</div>
              <div className="text-center">
                <div className="font-medium">箭塔</div>
                <div className="text-sm text-gray-600">50积分</div>
              </div>
            </div>
            <div className="tower-item p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
              <div className="text-center text-2xl mb-2">💣</div>
              <div className="text-center">
                <div className="font-medium">炮塔</div>
                <div className="text-sm text-gray-600">60积分</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowerDefense; 
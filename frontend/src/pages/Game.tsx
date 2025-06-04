import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import Navbar from '../components/Navbar';
import GameStatusBar from '../components/GameStatusBar';

// 模拟游戏状态
const initialGameState = {
  exp: 0,
  level: 1,
  maxExp: 100
};

const Game: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);
  const [gameState, setGameState] = useState(initialGameState);

  // 检查用户是否已登录
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <GameStatusBar 
        exp={gameState.exp}
        level={gameState.level}
        maxExp={gameState.maxExp}
      />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Game; 
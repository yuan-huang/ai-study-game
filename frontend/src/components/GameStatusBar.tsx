import React from 'react';
import { useUserStore } from '../stores/userStore';

interface GameStatus {
  exp: number;
  level: number;
  maxExp: number;
}

const GameStatusBar: React.FC<GameStatus> = ({ exp, level, maxExp }) => {
  const user = useUserStore(state => state.user);

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* 左侧用户信息 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-gray-600">姓名：</span>
          <span className="font-medium">{user?.name}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600">年级：</span>
          <span className="font-medium">{user?.grade}</span>
        </div>
      </div>

      {/* 右侧经验值和等级 */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">等级：</span>
          <span className="text-xl font-bold text-blue-600">{level}</span>
        </div>
        <div className="flex flex-col w-48">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">经验值：</span>
            <span className="text-gray-600">{exp}/{maxExp}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(exp / maxExp) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatusBar; 
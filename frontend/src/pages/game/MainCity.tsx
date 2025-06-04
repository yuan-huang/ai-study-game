import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../stores/inventoryStore';
import Inventory from '../../components/Inventory';
import { testItems } from '../../data/items';
import toast from 'react-hot-toast';

interface GameModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: string;
}

const gameModules: GameModule[] = [
  {
    id: 'tower-defense',
    name: '知识塔防',
    icon: '🏰',
    description: '通过答题来建造防御塔，保护知识城堡',
    path: '/game/tower-defense'
  },
  {
    id: 'study-room',
    name: '学习室',
    icon: '📚',
    description: '专注学习，获取知识点',
    path: '/game/study-room'
  },
  {
    id: 'shop',
    name: '商城',
    icon: '🏪',
    description: '使用积分兑换奖励',
    path: '/game/shop'
  }
];

const MainCity: React.FC = () => {
  const navigate = useNavigate();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const { items, maxSlots, removeItem, addItem } = useInventoryStore();

  // 初始化测试物品
  useEffect(() => {
    if (items.length === 0) {
      testItems.forEach(item => {
        addItem(item);
      });
    }
  }, []);

  const handleItemUse = (item: any) => {
    // 处理物品使用逻辑
    toast.success(`使用了 ${item.name}`);
    removeItem(item.id);
  };

  const handleItemDrop = (item: any) => {
    // 处理物品丢弃逻辑
    toast.success(`丢弃了 ${item.name}`);
    removeItem(item.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">知识城堡</h2>
        <button
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <span className="text-xl">🎒</span>
          <span>背包</span>
          <span className="bg-blue-600 px-2 rounded-full">
            {items.length}/{maxSlots}
          </span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameModules.map((module) => (
          <div
            key={module.id}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => navigate(module.path)}
          >
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{module.icon}</span>
              <h3 className="text-xl font-semibold text-gray-800">{module.name}</h3>
            </div>
            <p className="text-gray-600">{module.description}</p>
          </div>
        ))}
      </div>

      {/* 背包弹窗 */}
      {isInventoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
            <div className="p-4">
              <Inventory
                items={items}
                maxSlots={maxSlots}
                onItemUse={handleItemUse}
                onItemDrop={handleItemDrop}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsInventoryOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainCity; 
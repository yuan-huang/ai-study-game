import React, { useState } from 'react';
import { Item, ItemRarity } from '../types/inventory';

interface InventoryProps {
  items: Item[];
  maxSlots: number;
  onItemUse?: (item: Item) => void;
  onItemDrop?: (item: Item) => void;
}

// 品质对应的颜色
const rarityColors: Record<ItemRarity, string> = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
};

const Inventory: React.FC<InventoryProps> = ({
  items,
  maxSlots,
  onItemUse,
  onItemDrop
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  // 生成空格子数组
  const slots = Array(maxSlots).fill(null).map((_, index) => {
    return items[index] || null;
  });

  const handleItemClick = (item: Item | null) => {
    if (item) {
      setSelectedItem(item);
      setIsDetailsVisible(true);
    }
  };

  const handleUseItem = (item: Item) => {
    onItemUse?.(item);
    setIsDetailsVisible(false);
  };

  const handleDropItem = (item: Item) => {
    onItemDrop?.(item);
    setIsDetailsVisible(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">背包</h2>
        <span className="text-gray-600">
          {items.length}/{maxSlots}
        </span>
      </div>

      {/* 背包格子 */}
      <div className="grid grid-cols-4 gap-2">
        {slots.map((item, index) => (
          <div
            key={index}
            className={`
              w-full aspect-square border-2 rounded p-1 cursor-pointer
              hover:bg-gray-50 transition-colors duration-200
              ${item ? rarityColors[item.rarity] : 'border-gray-200'}
            `}
            onClick={() => handleItemClick(item)}
          >
            {item && (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs text-center text-gray-600 truncate w-full">
                  {item.name}
                </span>
                {item.quantity && item.quantity > 1 && (
                  <span className="absolute bottom-0 right-0 text-xs bg-gray-800 text-white px-1 rounded">
                    {item.quantity}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 物品详情弹窗 */}
      {isDetailsVisible && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-3">{selectedItem.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedItem.name}
                </h3>
                <span className={`text-sm ${rarityColors[selectedItem.rarity].replace('border', 'text')}`}>
                  {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{selectedItem.description}</p>

            {selectedItem.stats && Object.entries(selectedItem.stats).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">属性：</h4>
                {Object.entries(selectedItem.stats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between text-sm">
                    <span className="text-gray-600">{stat}</span>
                    <span className="text-blue-600">+{value}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedItem.effects && selectedItem.effects.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">效果：</h4>
                {selectedItem.effects.map((effect, index) => (
                  <div key={index} className="text-sm mb-1">
                    <span className="font-medium text-purple-600">{effect.name}</span>
                    <p className="text-gray-600">{effect.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {onItemUse && (
                <button
                  onClick={() => handleUseItem(selectedItem)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  使用
                </button>
              )}
              {onItemDrop && (
                <button
                  onClick={() => handleDropItem(selectedItem)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  丢弃
                </button>
              )}
              <button
                onClick={() => setIsDetailsVisible(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory; 
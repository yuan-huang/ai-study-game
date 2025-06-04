// 物品类型
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'special';

// 物品品质
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

// 物品接口
export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  description: string;
  stackable: boolean;
  quantity?: number;
  stats?: {
    [key: string]: number;
  };
  effects?: {
    name: string;
    description: string;
  }[];
}

// 背包接口
export interface Inventory {
  maxSlots: number;
  items: Item[];
} 
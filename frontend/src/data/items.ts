import { Item } from '../types/inventory';

export const testItems: Item[] = [
  {
    id: 'health-potion',
    name: '生命药水',
    type: 'consumable',
    rarity: 'common',
    icon: '❤️',
    description: '恢复50点生命值',
    stackable: true,
    quantity: 5,
    effects: [
      {
        name: '生命恢复',
        description: '立即恢复50点生命值'
      }
    ]
  },
  {
    id: 'magic-sword',
    name: '知识之剑',
    type: 'weapon',
    rarity: 'rare',
    icon: '⚔️',
    description: '蕴含知识力量的神秘之剑',
    stackable: false,
    stats: {
      '攻击力': 25,
      '智力': 10
    }
  },
  {
    id: 'wisdom-scroll',
    name: '智慧卷轴',
    type: 'consumable',
    rarity: 'epic',
    icon: '📜',
    description: '使用后获得临时智力加成',
    stackable: true,
    quantity: 3,
    effects: [
      {
        name: '智力提升',
        description: '提升20点智力，持续5分钟'
      }
    ]
  },
  {
    id: 'golden-armor',
    name: '黄金护甲',
    type: 'armor',
    rarity: 'legendary',
    icon: '🛡️',
    description: '传说中的护甲，能够提供强大的防护',
    stackable: false,
    stats: {
      '防御力': 50,
      '生命值': 100
    }
  },
  {
    id: 'magic-dust',
    name: '魔法粉尘',
    type: 'material',
    rarity: 'common',
    icon: '✨',
    description: '用于制作魔法物品的基础材料',
    stackable: true,
    quantity: 10
  }
]; 
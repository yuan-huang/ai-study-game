// 用户相关类型
export interface User {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  level: number;
  experience: number;
  coins: number;
  grade: number;
  subjects: string[];
  inventory: {
    seeds: string[];
    tools: string[];
    fruits: string[];
  };
  gameProgress: {
    currentGarden: string;
    completedTasks: string[];
    achievements: string[];
  };
  loginHistory: {
    lastLogin: Date;
    loginCount: number;
  };
}

// 种子相关类型
export interface Seed {
  id: string;
  name: string;
  type: 'flower' | 'fruit' | 'vegetable' | 'tree';
  subject: string;
  grade: number;
  knowledge_points: string[];
  difficulty: number;
  growth_stages: GrowthStage[];
  rewards: {
    experience: number;
    coins: number;
    fruits: string[];
  };
  owner: string;
  planted_at?: Date;
  status: 'seed' | 'growing' | 'mature' | 'harvested';
  current_stage: number;
  description: string;
  position?: {
    x: number;
    y: number;
  };
  tasks: Task[];
}

export interface GrowthStage {
  stage: 'seedling' | 'growing' | 'flowering' | 'fruiting';
  tasks: Task[];
}

export interface Task {
  id: string;
  type: string;
  description: string;
  completed: boolean;
  requirements: {
    time?: number;
    score?: number;
  };
}

// 游戏场景类型
export type GameScene = 'login' | 'garden' | 'study' | 'shop' | 'inventory';

export interface GameObject {
  id: string;
  type: 'seed' | 'plant' | 'tool' | 'decoration';
  position: { x: number; y: number };
  size: { width: number; height: number };
  sprite: string;
  interactive: boolean;
  data?: any;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
}

// 游戏配置类型
export interface GameConfig {
  scenes: GameScene[];
  subjects: string[];
  grades: number[];
  taskTypes: {
    watering: { name: string; description: string; icon: string };
    fertilizing: { name: string; description: string; icon: string };
    pest_control: { name: string; description: string; icon: string };
    harvest: { name: string; description: string; icon: string };
  };
}

// 娱乐游戏类型
export interface MiniGame {
  id: string;
  name: string;
  type: 'airplane' | 'tower_defense' | 'pet_care';
  description: string;
  cost: number; // 积分消耗
  highScore?: number;
  playCount?: number;
} 
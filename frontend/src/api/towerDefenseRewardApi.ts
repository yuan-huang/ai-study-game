import { post, get } from '../utils/request';

// 游戏完成数据接口
export interface GameCompletionData {
  userId: string;
  subject: string;
  grade: number;
  category: string;
  questionIds: string[];
  wrongQuestionIds: string[];
  completionTime: number;
  score: number;
  comboCount?: number;
}

// 奖励接口
export interface Reward {
  type: 'flower' | 'nectar';
  item: {
    id: string;
    subject: string;
    grade: number;
    category: string;
    hp?: number;
    maxHp?: number;
    healingPower?: number;
    message: string;
  };
}

// 游戏记录接口
export interface GameRecord {
  id: string;
  completionTime: number;
  score: number;
  comboCount: number;
  completedAt: Date;
}

// 花朵接口
export interface Flower {
  id: string;
  subject: string;
  grade: number;
  category: string;
  hp: number;
  maxHp: number;
  isPlanted: boolean;
  gardenPosition: { x: number; y: number } | null;
  plantedAt: Date | null;
}

// 花园库存接口
export interface GardenInventory {
  flowers: { [key: string]: Flower[] };
  nectars: { [key: string]: number };
  totalFlowers: number;
  totalNectars: number;
  plantedFlowers: number;
}

// 游戏统计接口
export interface GameStats {
  totalGames: number;
  statsBySubject: {
    subject: string;
    grade: number;
    category: string;
    completions: number;
    bestScore: number;
    bestTime: number;
    totalScore: number;
    averageScore: number;
  }[];
  recentGames: {
    id: string;
    subject: string;
    grade: number;
    category: string;
    score: number;
    completionTime: number;
    wrongAnswers: number;
    completedAt: Date;
  }[];
}

// 花园操作相关接口
export interface PlantFlowerData {
  userId: string;
  flowerId: string;
  position: { x: number; y: number };
}

export interface MoveFlowerData {
  userId: string;
  flowerId: string;
  newPosition: { x: number; y: number };
}

export interface HealFlowerData {
  userId: string;
  flowerId: string;
  nectarSubject: string;
  nectarGrade: number;
  nectarCategory: string;
  healingAmount: number;
}

export interface HarvestFlowerData {
  userId: string;
  flowerId: string;
}

/**
 * 保存游戏通关记录并获取奖励
 */
export const saveGameCompletion = async (gameData: GameCompletionData): Promise<{
  gameRecord: GameRecord;
  reward: Reward | null;
  stats: {
    totalCompletions: number;
    experienceGained: number;
    coinsGained: number;
  };
}> => {
  try {
    const response = await post<{
      gameRecord: GameRecord;
      reward: Reward | null;
      stats: {
        totalCompletions: number;
        experienceGained: number;
        coinsGained: number;
      };
    }>('/tower-defense/complete', gameData);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '保存游戏记录失败');
    }
  } catch (error) {
    console.error('保存游戏完成记录失败:', error);
    throw error;
  }
};

/**
 * 获取用户的花园库存
 */
export const getUserGardenInventory = async (userId: string): Promise<GardenInventory> => {
  try {
    const response = await get<GardenInventory>(`/tower-defense/inventory/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取花园库存失败');
    }
  } catch (error) {
    console.error('获取花园库存失败:', error);
    throw error;
  }
};

/**
 * 获取用户的游戏统计信息
 */
export const getUserGameStats = async (userId: string): Promise<GameStats> => {
  try {
    const response = await get<GameStats>(`/tower-defense/stats/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取游戏统计失败');
    }
  } catch (error) {
    console.error('获取游戏统计失败:', error);
    throw error;
  }
};

/**
 * 种植花朵到花园
 */
export const plantFlower = async (plantData: PlantFlowerData): Promise<Flower> => {
  try {
    const response = await post<Flower>('/garden/plant', plantData);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '种植花朵失败');
    }
  } catch (error) {
    console.error('种植花朵失败:', error);
    throw error;
  }
};

/**
 * 收获花朵（从花园移回仓库）
 */
export const harvestFlower = async (harvestData: HarvestFlowerData): Promise<Flower> => {
  try {
    const response = await post<Flower>('/garden/harvest', harvestData);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '收获花朵失败');
    }
  } catch (error) {
    console.error('收获花朵失败:', error);
    throw error;
  }
};

/**
 * 移动花朵在花园中的位置
 */
export const moveFlower = async (moveData: MoveFlowerData): Promise<Flower> => {
  try {
    const response = await post<Flower>('/garden/move', moveData);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '移动花朵失败');
    }
  } catch (error) {
    console.error('移动花朵失败:', error);
    throw error;
  }
};

/**
 * 使用甘露治疗花朵
 */
export const healFlower = async (healData: HealFlowerData): Promise<{
  flower: Flower;
  remainingNectar: number;
}> => {
  try {
    const response = await post<{
      flower: Flower;
      remainingNectar: number;
    }>('/garden/heal', healData);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '治疗花朵失败');
    }
  } catch (error) {
    console.error('治疗花朵失败:', error);
    throw error;
  }
};

/**
 * 获取花园布局（已种植的花朵）
 */
export const getGardenLayout = async (userId: string): Promise<Flower[]> => {
  try {
    const response = await get<Flower[]>(`/garden/layout/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取花园布局失败');
    }
  } catch (error) {
    console.error('获取花园布局失败:', error);
    throw error;
  }
};

/**
 * 获取仓库中未种植的花朵
 */
export const getWarehouseFlowers = async (userId: string): Promise<Flower[]> => {
  try {
    const response = await get<Flower[]>(`/garden/warehouse/flowers/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取仓库花朵失败');
    }
  } catch (error) {
    console.error('获取仓库花朵失败:', error);
    throw error;
  }
};

/**
 * 批量种植花朵
 */
export const batchPlantFlowers = async (plantDataList: PlantFlowerData[]): Promise<Flower[]> => {
  try {
    const response = await post<Flower[]>('/garden/batch-plant', { flowers: plantDataList });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '批量种植花朵失败');
    }
  } catch (error) {
    console.error('批量种植花朵失败:', error);
    throw error;
  }
};

/**
 * 自动种植花朵（系统自动选择位置）
 */
export const autoPlantFlower = async (userId: string, flowerId: string): Promise<Flower> => {
  try {
    const response = await post<Flower>('/garden/auto-plant', { userId, flowerId });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '自动种植花朵失败');
    }
  } catch (error) {
    console.error('自动种植花朵失败:', error);
    throw error;
  }
};

/**
 * 获取花园仓库道具（花朵和甘露）
 */
export const getGardenWarehouseItems = async (userId: string): Promise<{
  plantedFlowers: Flower[];
  warehouseFlowers: Flower[];
  nectars: {
    subject: string;
    grade: number;
    category: string;
    totalHealingPower: number;
    count: number;
  }[];
  totalFlowers: number;
  totalNectars: number;
  plantedFlowersCount: number;
  warehouseFlowersCount: number;
}> => {
  try {
    const response = await get<{
      plantedFlowers: Flower[];
      warehouseFlowers: Flower[];
      nectars: {
        subject: string;
        grade: number;
        category: string;
        totalHealingPower: number;
        count: number;
      }[];
      totalFlowers: number;
      totalNectars: number;
      plantedFlowersCount: number;
      warehouseFlowersCount: number;
    }>(`/garden/warehouse/items/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取花园仓库道具失败');
    }
  } catch (error) {
    console.error('获取花园仓库道具失败:', error);
    throw error;
  }
};

/**
 * 根据学科和年级获取花朵图片路径
 */
export const getFlowerImagePath = (subject: string, grade: number, category: string): string => {
  // 根据学科返回对应的花朵图片
  const flowerMap: { [key: string]: string } = {
    'chinese': '/images/ui/flowers/flower-chinese.png',
    'math': '/images/ui/flowers/flower-math.png',
    'english': '/images/ui/flowers/flower-english.png',
    'curious': '/images/ui/flowers/flower-technology.png',
    'knowledge': '/images/ui/flowers/flower-marine.png'
  };
  
  return flowerMap[subject] || '/images/ui/flowers/flower-chinese.png';
};

/**
 * 获取奖励显示文本
 */
export const getRewardDisplayText = (reward: Reward): string => {
  if (reward.type === 'flower') {
    return `获得新花朵: ${reward.item.subject}年级${reward.item.grade} ${reward.item.category}`;
  } else {
    return `获得甘露: ${reward.item.subject}年级${reward.item.grade} ${reward.item.category} (恢复${reward.item.healingPower}HP)`;
  }
};

/**
 * 格式化完成时间显示
 */
export const formatCompletionTime = (timeMs: number): string => {
  const seconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

/**
 * 获取花朵健康状态
 */
export const getFlowerHealthStatus = (flower: Flower): {
  status: 'healthy' | 'injured' | 'critical';
  percentage: number;
  statusText: string;
} => {
  const percentage = (flower.hp / flower.maxHp) * 100;
  
  if (percentage >= 80) {
    return {
      status: 'healthy',
      percentage,
      statusText: '健康'
    };
  } else if (percentage >= 30) {
    return {
      status: 'injured',
      percentage,
      statusText: '受伤'
    };
  } else {
    return {
      status: 'critical',
      percentage,
      statusText: '危险'
    };
  }
};

/**
 * 计算需要的甘露数量来完全治疗花朵
 */
export const calculateNectarNeeded = (flower: Flower, nectarHealingPower: number): number => {
  const missingHp = flower.maxHp - flower.hp;
  return Math.ceil(missingHp / nectarHealingPower);
};

/**
 * 获取花园中所有花朵（应用遗忘曲线计算实时HP）
 */
export const getGardenFlowersWithMemory = async (userId: string): Promise<{
  flowers: Array<{
    id: string;
    subject: string;
    grade: number;
    category: string;
    originalHP: number;
    currentHP: number;
    maxHP: number;
    isPlanted: boolean;
    gardenPosition: { x: number; y: number };
    plantedAt: Date | null;
    lastHealedAt: Date | null;
    memoryStatus: {
      level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      percentage: number;
      description: string;
      color: string;
    };
    predictions: {
      in24Hours: number;
      in7Days: number;
    };
  }>;
  memoryHealth: {
    averageHP: number;
    totalFlowers: number;
    healthyFlowers: number;
    criticalFlowers: number;
    overallGrade: string;
    recommendations: string[];
  };
}> => {
  try {
    const response = await get<{
      flowers: Array<{
        id: string;
        subject: string;
        grade: number;
        category: string;
        originalHP: number;
        currentHP: number;
        maxHP: number;
        isPlanted: boolean;
        gardenPosition: { x: number; y: number };
        plantedAt: Date | null;
        lastHealedAt: Date | null;
        memoryStatus: {
          level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
          percentage: number;
          description: string;
          color: string;
        };
        predictions: {
          in24Hours: number;
          in7Days: number;
        };
      }>;
      memoryHealth: {
        averageHP: number;
        totalFlowers: number;
        healthyFlowers: number;
        criticalFlowers: number;
        overallGrade: string;
        recommendations: string[];
      };
    }>(`/garden/memory/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取花园记忆状态失败');
    }
  } catch (error) {
    console.error('获取花园记忆状态失败:', error);
    throw error;
  }
};

/**
 * 获取单朵花的遗忘曲线数据
 */
export const getFlowerForgetCurve = async (
  userId: string, 
  flowerId: string, 
  durationHours: number = 168
): Promise<{
  flower: {
    id: string;
    subject: string;
    grade: number;
    category: string;
    currentHP: number;
    maxHP: number;
    memoryStatus: {
      level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      percentage: number;
      description: string;
      color: string;
    };
  };
  curveData: Array<{
    time: number;
    hp: number;
    percentage: number;
  }>;
  recommendations: string[];
}> => {
  try {
    const response = await get<{
      flower: {
        id: string;
        subject: string;
        grade: number;
        category: string;
        currentHP: number;
        maxHP: number;
        memoryStatus: {
          level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
          percentage: number;
          description: string;
          color: string;
        };
      };
      curveData: Array<{
        time: number;
        hp: number;
        percentage: number;
      }>;
      recommendations: string[];
    }>(`/garden/forget-curve/${userId}/${flowerId}?durationHours=${durationHours}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取遗忘曲线数据失败');
    }
  } catch (error) {
    console.error('获取遗忘曲线数据失败:', error);
    throw error;
  }
};

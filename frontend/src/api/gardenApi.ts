import { get, post, ApiResponse } from '../utils/request';

// 学科类型
export type SubjectType = 'chinese' | 'math' | 'english' | 'technology' | 'marine';

// 花朵相关接口
export interface FlowerData {
  id: string;
  subject: string;
  grade: number;
  category: string;
  hp: number;
  maxHp: number;
  isPlanted: boolean;
  gardenPosition?: { x: number; y: number };
  plantedAt?: string;
  lastHealedAt?: string;
  memoryStatus?: {
    level: string;
    percentage: number;
    description: string;
    color: string;
  };
  predictions?: {
    in24Hours: number;
    in7Days: number;
  };
}

// 甘露相关接口
export interface NectarData {
  subject: string;
  grade: number;
  category: string;
  totalHealingPower: number;
  count: number; // 已合并的甘露数量（技术上一个学科-分类只有一个甘露，但后端可能合并显示）
}

// 花园布局接口
export interface GardenLayout {
  plantedFlowers: FlowerData[];
  warehouseFlowers: FlowerData[];
  nectars: NectarData[];
  totalFlowers: number;
  totalNectars: number;
  plantedFlowersCount: number;
  warehouseFlowersCount: number;
}

// 记忆健康度接口
export interface MemoryHealth {
  averageHP: number;
  totalFlowers: number;
  healthyFlowers: number;
  criticalFlowers: number;
  overallGrade: string;
  recommendations: string[];
}

// 花园记忆状态接口
export interface GardenMemoryData {
  flowers: FlowerData[];
  memoryHealth: MemoryHealth;
}

// 种植花朵请求参数
export interface PlantFlowerParams {
  userId: string;
  flowerId: string;
  position: { x: number; y: number };
}

// 治疗花朵请求参数
export interface HealFlowerParams {
  userId: string;
  flowerId: string;
  nectarSubject: string;
  nectarGrade: number;
  nectarCategory: string;
  healingAmount: number;
}

// 移动花朵请求参数
export interface MoveFlowerParams {
  userId: string;
  flowerId: string;
  newPosition: { x: number; y: number };
}

// 批量种植请求参数
export interface BatchPlantParams {
  flowers: PlantFlowerParams[];
}

// 收获花朵请求参数
export interface HarvestFlowerParams {
  userId: string;
  flowerId: string;
}

// 自动种植请求参数
export interface AutoPlantParams {
  userId: string;
  flowerId: string;
}

// 治疗响应接口
export interface HealFlowerResponse {
  flower: FlowerData;
  remainingNectar: number;
}

// 遗忘曲线数据接口
export interface ForgetCurveData {
  flower: {
    id: string;
    subject: string;
    grade: number;
    category: string;
    currentHP: number;
    maxHP: number;
    memoryStatus: {
      level: string;
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
}

// 学科花朵状态接口
export interface SubjectFlowerStatus {
  subject: string;
  当前等级: number;
  总等级: number;
  已闯关分类数: number;
  总分类数: number;
  花的体积比例: number;
  闯关完成度: number;
  待闯关: Array<{
    分类: string;
    问题数: number;
    平均难度: number;
  }>;
  已闯关: Array<{
    分类: string;
    问题数: number;
    花朵数量: number;
    闯关次数: number;
    最后闯关时间?: string;
  }>;
  花的血量HP: {
    当前花总的HP: number;
    最大花总的HP: number;
    HP百分比: number;
    category: Array<{
      分类: string;
      hp值: number;
      最大hp值: number;
      上一次闯关时间?: string;
      闯关次数: number;
      花朵数量: number;
      问题总数: number;
    }>;
  };
  error?: string;
}

// 学科花朵状态响应接口
export interface SubjectFlowerStatusResponse {
  userId: string;
  userGrade: number;
  subjectFlowers: SubjectFlowerStatus[];
  summary: {
    totalSubjects: number;
    totalCurrentLevel: number;
    totalMaxLevel: number;
    averageHPPercentage: number;
  };
}

export class GardenApiService {
  /**
   * 种植花朵到花园
   * @param userId 用户ID
   * @param flowerId 花朵ID
   * @param position 种植位置
   */
  async plantFlower(
    userId: string,
    flowerId: string,
    position: { x: number; y: number }
  ): Promise<ApiResponse<FlowerData>> {
    return post<FlowerData>('/garden/plant', {
      userId,
      flowerId,
      position
    });
  }

  /**
   * 种植花朵到花园（使用参数对象）
   * @param params 种植参数
   */
  async plantFlowerWithParams(params: PlantFlowerParams): Promise<ApiResponse<FlowerData>> {
    return this.plantFlower(params.userId, params.flowerId, params.position);
  }

  /**
   * 收获花朵（移回仓库）
   * @param userId 用户ID
   * @param flowerId 花朵ID
   */
  async harvestFlower(userId: string, flowerId: string): Promise<ApiResponse<FlowerData>> {
    return post<FlowerData>('/garden/harvest', {
      userId,
      flowerId
    });
  }

  /**
   * 收获花朵（使用参数对象）
   * @param params 收获参数
   */
  async harvestFlowerWithParams(params: HarvestFlowerParams): Promise<ApiResponse<FlowerData>> {
    return this.harvestFlower(params.userId, params.flowerId);
  }

  /**
   * 移动花朵位置
   * @param userId 用户ID
   * @param flowerId 花朵ID
   * @param newPosition 新位置
   */
  async moveFlower(
    userId: string,
    flowerId: string,
    newPosition: { x: number; y: number }
  ): Promise<ApiResponse<FlowerData>> {
    return post<FlowerData>('/garden/move', {
      userId,
      flowerId,
      newPosition
    });
  }

  /**
   * 移动花朵位置（使用参数对象）
   * @param params 移动参数
   */
  async moveFlowerWithParams(params: MoveFlowerParams): Promise<ApiResponse<FlowerData>> {
    return this.moveFlower(params.userId, params.flowerId, params.newPosition);
  }

  /**
   * 使用甘露治疗花朵
   * @param userId 用户ID
   * @param flowerId 花朵ID
   * @param nectarSubject 甘露学科
   * @param nectarGrade 甘露年级
   * @param nectarCategory 甘露分类
   * @param healingAmount 治疗量
   */
  async healFlower(
    userId: string,
    flowerId: string,
    nectarSubject: string,
    nectarGrade: number,
    nectarCategory: string,
    healingAmount: number
  ): Promise<ApiResponse<HealFlowerResponse>> {
    return post<HealFlowerResponse>('/garden/heal', {
      userId,
      flowerId,
      nectarSubject,
      nectarGrade,
      nectarCategory,
      healingAmount
    });
  }

  /**
   * 使用甘露治疗花朵（使用参数对象）
   * @param params 治疗参数
   */
  async healFlowerWithParams(params: HealFlowerParams): Promise<ApiResponse<HealFlowerResponse>> {
    return this.healFlower(
      params.userId,
      params.flowerId,
      params.nectarSubject,
      params.nectarGrade,
      params.nectarCategory,
      params.healingAmount
    );
  }

  /**
   * 获取花园布局（已种植的花朵）
   * @param userId 用户ID
   */
  async getGardenLayout(userId: string): Promise<ApiResponse<FlowerData[]>> {
    return get<FlowerData[]>(`/garden/layout/${userId}`);
  }

  /**
   * 获取仓库中未种植的花朵
   * @param userId 用户ID
   */
  async getWarehouseFlowers(userId: string): Promise<ApiResponse<FlowerData[]>> {
    return get<FlowerData[]>(`/garden/warehouse/flowers/${userId}`);
  }


  /**
   * 批量种植花朵
   * @param flowers 花朵数据数组
   */
  async batchPlantFlowers(flowers: PlantFlowerParams[]): Promise<ApiResponse<FlowerData[]>> {
    return post<FlowerData[]>('/garden/batch-plant', { flowers });
  }

  /**
   * 批量种植花朵（使用参数对象）
   * @param params 批量种植参数
   */
  async batchPlantFlowersWithParams(params: BatchPlantParams): Promise<ApiResponse<FlowerData[]>> {
    return this.batchPlantFlowers(params.flowers);
  }

  /**
   * 自动种植花朵（系统自动选择位置）
   * @param userId 用户ID
   * @param flowerId 花朵ID
   */
  async autoPlantFlower(userId: string, flowerId: string): Promise<ApiResponse<FlowerData>> {
    return post<FlowerData>('/garden/auto-plant', {
      userId,
      flowerId
    });
  }

  /**
   * 自动种植花朵（使用参数对象）
   * @param params 自动种植参数
   */
  async autoPlantFlowerWithParams(params: AutoPlantParams): Promise<ApiResponse<FlowerData>> {
    return this.autoPlantFlower(params.userId, params.flowerId);
  }

  /**
   * 获取花园记忆状态（应用遗忘曲线）
   * @param userId 用户ID
   */
  async getGardenMemoryState(userId: string): Promise<ApiResponse<GardenMemoryData>> {
    return get<GardenMemoryData>(`/garden/memory/${userId}`);
  }

  /**
   * 获取单朵花的遗忘曲线数据
   * @param userId 用户ID
   * @param flowerId 花朵ID
   * @param durationHours 预测时长（小时，默认168小时即7天）
   */
  async getFlowerForgetCurve(
    userId: string,
    flowerId: string,
    durationHours: number = 168
  ): Promise<ApiResponse<ForgetCurveData>> {
    return get<ForgetCurveData>(`/garden/forget-curve/${userId}/${flowerId}?durationHours=${durationHours}`);
  }

  /**
   * 获取各学科花朵状态信息
   * @param userId 用户ID
   */
  async getSubjectFlowerStatus(): Promise<ApiResponse<SubjectFlowerStatusResponse>> {
    return get<SubjectFlowerStatusResponse>(`/garden/subject-status`);
  }

  /**
   * 获取用户甘露库存
   * @param userId 用户ID
   */
  async getNectarInventory(): Promise<ApiResponse<{
    nectars: NectarData[];
    totalNectars: number;
    totalTypes: number;
  }>> {
    return get(`/garden/nectar`);
  }

  /**
   * 使用甘露治疗对应学科分类的所有花朵
   * @param subject 学科
   * @param category 分类
   */
  async useNectar(
    subject: string,
    category: string
  ): Promise<ApiResponse<{
    subject: string;
    grade: number;
    category: string;
    healedFlowersCount: number;
    deletedNectarsCount: number;
    healedFlowers: Array<{
      id: string;
      subject: string;
      grade: number;
      category: string;
      beforeHP: number;
      afterHP: number;
      healedAmount: number;
      maxHp: number;
    }>;
    note: string;
  }>> {
    return post('/garden/use-nectar', {
      subject,
      category
    });
  }

  /**
   * 智能花园管理 - 获取完整花园状态并提供管理建议
   * @param userId 用户ID
   */
  async getSmartGardenState(userId: string): Promise<ApiResponse<{
    layout: GardenLayout;
    memoryState: GardenMemoryData;
    recommendations: string[];
  }>> {
    try {
      // 并行获取花园布局和记忆状态
      const [layoutResponse, memoryResponse] = await Promise.all([
        this.getGardenWarehouse(userId),
        this.getGardenMemoryState(userId)
      ]);

      if (!layoutResponse.success || !memoryResponse.success) {
        return {
          success: false,
          message: '获取花园状态失败'
        };
      }

      // 生成智能建议
      const recommendations = this.generateSmartRecommendations(
        layoutResponse.data!,
        memoryResponse.data!
      );

      return {
        success: true,
        data: {
          layout: layoutResponse.data!,
          memoryState: memoryResponse.data!,
          recommendations
        },
        message: '成功获取智能花园状态'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '获取花园状态异常'
      };
    }
  }

  /**
   * 生成智能花园管理建议
   * @param layout 花园布局
   * @param memoryState 记忆状态
   */
  private generateSmartRecommendations(
    layout: GardenLayout,
    memoryState: GardenMemoryData
  ): string[] {
    const recommendations: string[] = [];

    // 基于花朵数量的建议
    if (layout.warehouseFlowers.length > 5) {
      recommendations.push('🌱 仓库中有很多花朵，建议种植一些到花园中');
    }

    if (layout.plantedFlowersCount === 0) {
      recommendations.push('🌺 花园是空的，快去种植第一朵花吧！');
    }

    // 基于记忆健康度的建议
    if (memoryState.memoryHealth.criticalFlowers > 0) {
      recommendations.push(`🚨 有${memoryState.memoryHealth.criticalFlowers}朵花朵濒临遗忘，需要立即复习！`);
    }

    if (memoryState.memoryHealth.averageHP < 50) {
      recommendations.push('💧 花园整体记忆健康度较低，建议多使用甘露治疗');
    }

    // 基于甘露数量的建议
    if (layout.nectars.length === 0) {
      recommendations.push('💧 没有甘露了，记得通过学习获取更多甘露');
    }

    // 学科分布建议
    const subjects = new Set(layout.plantedFlowers.map(f => f.subject));
    if (subjects.size === 1) {
      recommendations.push('📚 建议种植不同学科的花朵，保持知识的多样性');
    }

    return recommendations;
  }

  /**
   * 验证花园操作权限
   * @param userId 用户ID
   * @param flowerId 花朵ID
   */
  async validateGardenOperation(userId: string, flowerId: string): Promise<boolean> {
    try {
      const response = await this.getGardenWarehouse(userId);
      if (!response.success || !response.data) {
        return false;
      }

      // 检查花朵是否属于该用户
      const allFlowers = [...response.data.plantedFlowers, ...response.data.warehouseFlowers];
      return allFlowers.some(flower => flower.id === flowerId);
    } catch {
      return false;
    }
  }

  /**
   * 获取花朵精灵名称
   * @param subject 学科
   */
  getFlowerSprite(subject: string): string {
    const spriteMap: Record<string, string> = {
      'chinese': 'flower-chinese',
      'math': 'flower-math',
      'english': 'flower-english',
      'technology': 'flower-technology',
      'marine': 'flower-marine'
    };
    return spriteMap[subject] || 'flower-chinese';
  }

  /**
   * 获取花朵颜色
   * @param subject 学科
   */
  getFlowerColor(subject: string): number {
    const colorMap: Record<string, number> = {
      'chinese': 0xFF4444,
      'math': 0x4444FF,
      'english': 0x44FF44,
      'technology': 0xFF8800,
      'marine': 0x00DDDD
    };
    return colorMap[subject] || 0xFF4444;
  }

  /**
   * 获取HP条颜色
   * @param hp 当前HP
   * @param maxHP 最大HP
   */
  getHPColor(hp: number, maxHP: number): number {
    const percentage = hp / maxHP;
    if (percentage > 0.7) return 0x00FF00; // 绿色
    if (percentage > 0.3) return 0xFFFF00; // 黄色
    return 0xFF0000; // 红色
  }

  /**
   * 获取记忆状态描述
   * @param hp 当前HP
   * @param maxHP 最大HP
   */
  getMemoryStatusDescription(hp: number, maxHP: number): string {
    const percentage = (hp / maxHP) * 100;
    
    if (percentage >= 90) return '记忆优秀';
    if (percentage >= 70) return '记忆良好';
    if (percentage >= 50) return '记忆一般';
    if (percentage >= 30) return '记忆衰减';
    return '濒临遗忘';
  }

  /**
   * 计算推荐治疗量
   * @param flower 花朵数据
   * @param availableNectar 可用甘露
   */
  calculateRecommendedHealing(flower: FlowerData, availableNectar: NectarData[]): number {
    const missingHP = flower.maxHp - flower.hp;
    
    // 找到匹配的甘露
    const matchingNectar = availableNectar.find(nectar => 
      nectar.subject === flower.subject && 
      nectar.grade === flower.grade
    );

    if (!matchingNectar) return 0;

    // 推荐治疗量为缺失HP的一半，但不超过可用甘露
    const recommendedAmount = Math.min(
      Math.ceil(missingHP * 0.5),
      matchingNectar.totalHealingPower
    );

    return recommendedAmount;
  }

  /**
   * 格式化花园统计信息
   * @param layout 花园布局
   */
  formatGardenStats(layout: GardenLayout): {
    summary: string;
    details: Record<string, any>;
  } {
    const healthyFlowers = layout.plantedFlowers.filter(f => 
      f.hp && f.maxHp && (f.hp / f.maxHp) >= 0.7
    ).length;
    
    const totalPlanted = layout.plantedFlowersCount;
    const healthRate = totalPlanted > 0 ? Math.round((healthyFlowers / totalPlanted) * 100) : 0;
    
    const summary = `花园概况: ${totalPlanted}朵已种植，${healthRate}%健康`;
    
    const details = {
      totalFlowers: layout.totalFlowers,
      plantedFlowers: layout.plantedFlowersCount,
      warehouseFlowers: layout.warehouseFlowersCount,
      totalNectars: layout.totalNectars,
      healthyFlowers,
      healthRate
    };
    
    return { summary, details };
  }
}

// 创建默认的API服务实例供外部使用
export const gardenApi = new GardenApiService();

// 导出 ApiResponse 类型
export type { ApiResponse };

// 默认导出
export default gardenApi;

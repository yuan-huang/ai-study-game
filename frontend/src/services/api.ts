import { User, Seed } from '../types';

// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// API基础配置
const API_BASE_URL = '/api';

// 创建通用请求函数
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }

        return {
            success: true,
            data,
            message: data.message,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : '网络错误',
        };
    }
}

// 认证相关API
export const authApi = {
    // 登录
    login: (data: { username: string; grade: number; subjects: string[] }) =>
        request<{ user: User; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // 登出
    logout: () =>
        request('/auth/logout', {
            method: 'POST',
        }),
};

// 种子相关API
export const seedApi = {
    // 获取用户的种子列表
    getUserSeeds: (userId: string) =>
        request<Seed[]>(`/seeds/user/${userId}`),

    // 种植种子
    plantSeed: (seedId: string, position: { x: number; y: number }) =>
        request<Seed>(`/seeds/${seedId}/plant`, {
            method: 'POST',
            body: JSON.stringify({ position }),
        }),

    // 完成任务
    completeTask: (seedId: string, taskType: string) =>
        request<{ rewards: { experience: number; coins: number } }>(
            `/seeds/${seedId}/tasks/${taskType}/complete`,
            {
                method: 'POST',
            }
        ),
};

// 游戏进度接口
interface GameProgress {
  userId: string;
  level: number;
  score: number;
  completedChallenges: string[];
  lastUpdated: Date;
}

// 游戏进度API服务
export class GameProgressApiService {
  constructor() {
    // Implementation of GameProgressApiService
  }

  // 保存游戏进度
  async saveProgress(data: Partial<GameProgress>): Promise<ApiResponse<GameProgress>> {
    // Implementation of saveProgress method
  }

  // 获取游戏进度
  async getProgress(): Promise<ApiResponse<GameProgress>> {
    // Implementation of getProgress method
  }

  // 更新游戏进度
  async updateProgress(data: Partial<GameProgress>): Promise<ApiResponse<GameProgress>> {
    // Implementation of updateProgress method
  }
}

// API服务实例
export const gameProgressApi = new GameProgressApiService();

// 用户API服务
export class UserApiService {
  constructor() {
    // Implementation of UserApiService
  }

  // 用户登录
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Implementation of login method
  }

  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    // Implementation of getUserInfo method
  }

  // 更新用户信息
  async updateUserInfo(data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> {
    // Implementation of updateUserInfo method
  }
}

// API服务实例
export const userApi = new UserApiService(); 
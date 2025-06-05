import { User, Seed } from '../types';

// API响应接口
export interface ApiResponse<T = any> {
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

        return data; // 直接返回服务器响应的数据结构
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : '网络错误',
        };
    }
}

// 认证相关API
export const authApi = {
    // 登录 - 适应返回格式: { success: true, data: { user: User, token?: string } }
    login: (data: { username: string; grade: number; subjects: string[] }) =>
        request<{ user: User; sessionId?: string }>('/auth/login', {
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
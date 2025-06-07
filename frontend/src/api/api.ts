import { User, Seed } from '../types';
import { post, get, ApiResponse } from '../utils/request';

// 认证相关API
export const authApi = {
    // 登录 - 适应返回格式: { success: true, data: { user: User, token?: string } }
    login: (data: { username: string; grade: number; subjects: string[] }) =>
        post<{ user: User; sessionId?: string }>('/auth/login', data),

    // 登出
    logout: () =>
        post('/auth/logout'),
};

// 种子相关API
export const seedApi = {
    // 获取用户的种子列表
    getUserSeeds: (userId: string) =>
        get<Seed[]>(`/seeds/user/${userId}`),

    // 种植种子
    plantSeed: (seedId: string, position: { x: number; y: number }) =>
        post<Seed>(`/seeds/${seedId}/plant`, { position }),

    // 完成任务
    completeTask: (seedId: string, taskType: string) =>
        post<{ rewards: { experience: number; coins: number } }>(
            `/seeds/${seedId}/tasks/${taskType}/complete`
        ),
};

 
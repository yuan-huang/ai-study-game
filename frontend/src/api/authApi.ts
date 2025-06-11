import { User, Seed } from '../types';
import { post, get } from '../utils/request';

// 认证相关API
export const authApi = {
    // 登录 - 适应返回格式: { success: true, data: { user: User, token: string } }
    login: async (data: { username: string; grade: number; subjects: string[] }) => {
        const response = await post<{ user: User; token: string }>('/auth/login', data);
        if (response.success && response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // 登出
    logout: async () => {
        const response = await post('/auth/logout');
        localStorage.removeItem('token');
        return response;
    }
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

 
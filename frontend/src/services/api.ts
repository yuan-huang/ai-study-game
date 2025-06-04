import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { UserInfo } from '../types/user';

// API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// 登录请求接口
interface LoginRequest {
  username: string;
  grade: number;
  subjects: string[];
  profile: {
    school?: string;
    className?: string;
    gender: string;
  };
}

// 登录响应接口
interface LoginResponse {
  user: UserInfo;
  token: string;
}

// 基础API服务类
export class BaseApiService {
  protected api: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        // 从localStorage获取token
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        if (error.response) {
          // 处理401未授权
          if (error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  // 通用GET请求
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.get(url, config);
  }

  // 通用POST请求
  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.post(url, data, config);
  }

  // 通用PUT请求
  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.put(url, data, config);
  }

  // 通用DELETE请求
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.api.delete(url, config);
  }
}

// 用户API服务
export class UserApiService extends BaseApiService {
  constructor() {
    super('/api/users');
  }

  // 用户登录
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/login', data);
  }

  // 获取用户信息
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return this.get<UserInfo>('/me');
  }

  // 更新用户信息
  async updateUserInfo(data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> {
    return this.put<UserInfo>('/me', data);
  }
}

// 游戏进度接口
interface GameProgress {
  userId: string;
  level: number;
  score: number;
  completedChallenges: string[];
  lastUpdated: Date;
}

// 游戏进度API服务
export class GameProgressApiService extends BaseApiService {
  constructor() {
    super('/api/progress');
  }

  // 保存游戏进度
  async saveProgress(data: Partial<GameProgress>): Promise<ApiResponse<GameProgress>> {
    return this.post<GameProgress>('/', data);
  }

  // 获取游戏进度
  async getProgress(): Promise<ApiResponse<GameProgress>> {
    return this.get<GameProgress>('/');
  }

  // 更新游戏进度
  async updateProgress(data: Partial<GameProgress>): Promise<ApiResponse<GameProgress>> {
    return this.put<GameProgress>('/', data);
  }
}

// API服务实例
export const userApi = new UserApiService();
export const gameProgressApi = new GameProgressApiService(); 
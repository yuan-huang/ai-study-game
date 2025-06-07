/**
 * 通用HTTP请求工具
 * 封装fetch API，提供统一的错误处理和请求配置
 */

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// API基础配置
const API_BASE_URL = '/api';

// 默认请求配置
const DEFAULT_OPTIONS: RequestInit = {
    headers: {
        'Content-Type': 'application/json',
    }
};

/**
 * 获取认证token
 */
function getAuthToken(): string | null {
    return localStorage.getItem('token');
}

/**
 * 创建请求头
 */
function createHeaders(customHeaders: HeadersInit = {}): Record<string, string> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(customHeaders as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * 通用请求函数
 */
export async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        // 构建完整URL
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        
        // 合并请求配置
        const config: RequestInit = {
            ...DEFAULT_OPTIONS,
            ...options,
            headers: createHeaders(options.headers),
        };

        // 发送请求
        const response = await fetch(url, config);
        
        // 解析响应数据
        let data;
        try {
            data = await response.json();
        } catch {
            // 如果响应不是JSON格式，创建一个标准响应
            data = { 
                success: response.ok, 
                message: response.ok ? '请求成功' : '请求失败' 
            };
        }

        // 检查响应状态
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // 返回标准化响应
        return data;
    } catch (error) {
        console.error('Request failed:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : '网络错误',
        };
    }
}

/**
 * GET请求
 */
export async function get<T>(
    endpoint: string, 
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
        ...options,
        method: 'GET',
    });
}

/**
 * POST请求
 */
export async function post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT请求
 */
export async function put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE请求
 */
export async function del<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
        ...options,
        method: 'DELETE',
    });
}

/**
 * PATCH请求
 */
export async function patch<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * 上传文件
 */
export async function upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return request<T>(endpoint, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
    });
}

/**
 * 构建URL查询参数
 */
export function buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
        }
    });
    
    return searchParams.toString();
}

/**
 * 带查询参数的GET请求
 */
export async function getWithParams<T>(
    endpoint: string,
    params: Record<string, any> = {},
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const queryString = buildQueryString(params);
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return get<T>(url, options);
}

// 默认导出request函数
export default request; 
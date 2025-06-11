import { authApi, seedApi } from '../api/authApi';

interface UserData {
    id: string;
    username: string;
    displayName: string;
    level: number;
    experience: number;
    coins: number;
    grade: number;
    subjects: string[];
    school?: string;
    className?: string;
    gender?: string;
    inventory?: any[];
    gameProgress?: Record<string, any>;
}

interface LoginResponse {
    success: boolean;
    data?: {
        user: UserData;
        token: string;
    };
    message?: string;
}

export class GameStateStores {
    private static instance: GameStateStores;
    private _isAuthenticated: boolean = false;
    private _user: UserData | null = null;
    private _token: string | null = null;
    private _error: string | null = null;
    private _grade: string | null = null;

    private constructor() {
        // 检查本地存储中的token
        const token = localStorage.getItem('token');
        if (token) {
            this._token = token;
            this._isAuthenticated = true;
        }

        // 检查缓存的用户数据
        const cachedUser = localStorage.getItem('gameUser');
        if (cachedUser) {
            try {
                const userData = JSON.parse(cachedUser);
                this._user = userData;
                this._isAuthenticated = true;
                this._grade = String(userData.grade);
            } catch (error) {
                console.error('解析缓存用户数据失败:', error);
            }
        }
    }

    // Getters
    get isAuthenticated() { return this._isAuthenticated; }
    get user() { return this._user; }
    get token() { return this._token; }
    get error() { return this._error; }
    get grade() { return this._grade; }
    get userId() { return this._user?.id || ''; }
    get username() { return this._user?.username || ''; }
    get displayName() { return this._user?.displayName || ''; }
    get level() { return this._user?.level || 1; }
    get experience() { return this._user?.experience || 0; }
    get coins() { return this._user?.coins || 0; }
    get subjects() { return this._user?.subjects || []; }
    get school() { return this._user?.school || ''; }
    get className() { return this._user?.className || ''; }
    get gender() { return this._user?.gender || '男孩'; }
    get inventory() { return this._user?.inventory || []; }
    get gameProgress() { return this._user?.gameProgress || {}; }

    // 从缓存恢复状态
    async restoreFromCache(userData: UserData): Promise<void> {
        this._user = userData;
        this._isAuthenticated = true;
        this._grade = String(userData.grade);
    }

    // 登录方法
    async login(username: string, grade: number, subjects: string[]): Promise<UserData> {
        try {
            const response = await authApi.login({
                username,
                grade,
                subjects
            }) as LoginResponse;
            
            if (response.success && response.data) {
                this._isAuthenticated = true;
                this._user = response.data.user;
                this._token = response.data.token;
                this._error = null;
                this._grade = String(grade);

                // 保存token到本地存储
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('gameUser', JSON.stringify(response.data.user));


                return response.data.user;
            } else {
                throw new Error(response.message || '登录失败');
            }
        } catch (error) {
            this._error = error instanceof Error ? error.message : '登录失败';
            throw error;
        }
    }

    // 登出方法
    async logout(): Promise<void> {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('登出请求失败:', error);
        } finally {
            this._isAuthenticated = false;
            this._user = null;
            this._token = null;
            this._error = null;
            this._grade = null;

            // 清除本地存储
            localStorage.removeItem('token');
            localStorage.removeItem('gameUser');
        }
    }

    public static getInstance(): GameStateStores {
        if (!GameStateStores.instance) {
            GameStateStores.instance = new GameStateStores();
        }
        return GameStateStores.instance;
    }
}

export const gameStateStores = GameStateStores.getInstance(); 
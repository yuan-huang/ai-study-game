import { User, Seed } from '../types';
import { authApi, seedApi } from '../services/api';

class GameState {
    private static instance: GameState;
    
    private _user: User | null = null;
    private _isLoggedIn: boolean = false;
    private _currentScene: string = 'login';
    private _seeds: Seed[] = [];
    private _selectedSeed: Seed | null = null;
    private _loading: boolean = false;
    private _error: string | null = null;

    private constructor() {
        // 私有构造函数，确保单例模式
    }

    public static getInstance(): GameState {
        if (!GameState.instance) {
            GameState.instance = new GameState();
        }
        return GameState.instance;
    }

    // Getters
    get user() { return this._user; }
    get isLoggedIn() { return this._isLoggedIn; }
    get currentScene() { return this._currentScene; }
    get seeds() { return this._seeds; }
    get selectedSeed() { return this._selectedSeed; }
    get loading() { return this._loading; }
    get error() { return this._error; }

    // 登录方法
    async login(username: string, grade: number, subjects: string[]): Promise<void> {
        try {
            this._loading = true;
            this._error = null;

            const response = await authApi.login({ username, grade, subjects });
            
            if (response.success && response.data) {
                this._user = response.data.user;
                this._isLoggedIn = true;
                localStorage.setItem('token', response.data.token);
                
                // 登录成功后获取种子数据
                await this.fetchSeeds();
            } else {
                throw new Error(response.message || '登录失败');
            }
        } catch (error) {
            this._error = error instanceof Error ? error.message : '登录失败';
            throw error;
        } finally {
            this._loading = false;
        }
    }

    // 登出方法
    logout(): void {
        this._user = null;
        this._isLoggedIn = false;
        this._seeds = [];
        this._selectedSeed = null;
        this._currentScene = 'login';
        localStorage.removeItem('token');
        localStorage.removeItem('knowledge-garden-user');
    }

    // 设置当前场景
    setCurrentScene(sceneId: string): void {
        this._currentScene = sceneId;
    }

    // 获取种子列表
    async fetchSeeds(): Promise<void> {
        try {
            if (!this._user) return;

            const response = await seedApi.getUserSeeds(this._user.id);
            if (response.success && response.data) {
                this._seeds = response.data;
            } else {
                throw new Error(response.message || '获取种子失败');
            }
        } catch (error) {
            this._error = error instanceof Error ? error.message : '获取种子失败';
            throw error;
        }
    }

    // 选择种子
    selectSeed(seed: Seed | null): void {
        this._selectedSeed = seed;
    }

    // 种植种子
    async plantSeed(seedId: string, position: { x: number; y: number }): Promise<void> {
        try {
            this._loading = true;
            const response = await seedApi.plantSeed(seedId, position);
            
            if (response.success) {
                await this.fetchSeeds();
            } else {
                throw new Error(response.message || '种植失败');
            }
        } catch (error) {
            this._error = error instanceof Error ? error.message : '种植失败';
            throw error;
        } finally {
            this._loading = false;
        }
    }

    // 完成任务
    async completeTask(seedId: string, taskType: string): Promise<void> {
        try {
            this._loading = true;
            const response = await seedApi.completeTask(seedId, taskType);
            
            if (response.success && response.data?.rewards && this._user) {
                // 更新用户经验和金币
                this._user = {
                    ...this._user,
                    experience: this._user.experience + response.data.rewards.experience,
                    coins: this._user.coins + response.data.rewards.coins
                };
                
                // 更新种子状态
                await this.fetchSeeds();
            } else {
                throw new Error(response.message || '任务完成失败');
            }
        } catch (error) {
            this._error = error instanceof Error ? error.message : '任务完成失败';
            throw error;
        } finally {
            this._loading = false;
        }
    }

    // 设置加载状态
    setLoading(loading: boolean): void {
        this._loading = loading;
    }

    // 设置错误信息
    setError(error: string | null): void {
        this._error = error;
    }
}

export const gameState = GameState.getInstance(); 
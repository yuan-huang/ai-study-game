import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Seed, GameScene } from '@/types';
import { authApi, seedApi } from '@/services/api';

interface GameState {
  // 用户状态
  user: User | null;
  isLoggedIn: boolean;
  
  // 游戏状态
  currentScene: string;
  seeds: Seed[];
  selectedSeed: Seed | null;
  
  // UI状态
  loading: boolean;
  error: string | null;
  
  // 操作方法
  login: (username: string, grade: number, subjects: string[]) => Promise<void>;
  logout: () => void;
  setCurrentScene: (sceneId: string) => void;
  fetchSeeds: () => Promise<void>;
  selectSeed: (seed: Seed | null) => void;
  plantSeed: (seedId: string, position: { x: number; y: number }) => Promise<void>;
  completeTask: (seedId: string, taskType: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isLoggedIn: false,
      currentScene: 'garden',
      seeds: [],
      selectedSeed: null,
      loading: false,
      error: null,
      
      // 登录方法
      login: async (username: string, grade: number, subjects: string[]) => {
        try {
          set({ loading: true, error: null });
          const response = await authApi.login({ username, grade, subjects });
          
          if (response.success && response.data) {
            set({ 
              user: response.data.user, 
              isLoggedIn: true,
              loading: false 
            });
            
            // 登录成功后获取种子数据
            await get().fetchSeeds();
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '登录失败',
            loading: false 
          });
          throw error;
        }
      },
      
      // 登出方法
      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          seeds: [],
          selectedSeed: null,
          currentScene: 'garden'
        });
        // 清除本地存储
        localStorage.removeItem('knowledge-garden-user');
      },
      
      // 设置当前场景
      setCurrentScene: (sceneId: string) => {
        set({ currentScene: sceneId });
      },
      
      // 获取种子列表
      fetchSeeds: async () => {
        try {
          const { user } = get();
          if (!user) return;
          
          const response = await seedApi.getUserSeeds(user.id);
          if (response.success && response.data) {
            set({ seeds: response.data });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '获取种子失败' 
          });
        }
      },
      
      // 选择种子
      selectSeed: (seed: Seed | null) => {
        set({ selectedSeed: seed });
      },
      
      // 种植种子
      plantSeed: async (seedId: string, position: { x: number; y: number }) => {
        try {
          set({ loading: true });
          const response = await seedApi.plantSeed(seedId, position);
          
          if (response.success) {
            // 更新种子状态
            await get().fetchSeeds();
          }
          set({ loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '种植失败',
            loading: false 
          });
        }
      },
      
      // 完成任务
      completeTask: async (seedId: string, taskType: string) => {
        try {
          set({ loading: true });
          const response = await seedApi.completeTask(seedId, taskType);
          
          if (response.success) {
            // 更新种子状态和用户信息
            await get().fetchSeeds();
            
            // 更新用户经验和金币
            const { user } = get();
            if (user && response.data?.rewards) {
              const updatedUser = {
                ...user,
                experience: user.experience + response.data.rewards.experience,
                coins: user.coins + response.data.rewards.coins
              };
              set({ user: updatedUser });
            }
          }
          set({ loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '任务完成失败',
            loading: false 
          });
        }
      },
      
      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading });
      },
      
      // 设置错误信息
      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'knowledge-garden-game',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        currentScene: state.currentScene
      })
    }
  )
); 
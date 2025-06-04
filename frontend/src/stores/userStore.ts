import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '../types/user';

interface UserState {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null })
    }),
    {
      name: 'user-storage',
    }
  )
); 
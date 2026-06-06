import { create } from 'zustand';
import { User } from '@/types/models';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  hasCompletedOnboarding: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboardingCompleted: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));

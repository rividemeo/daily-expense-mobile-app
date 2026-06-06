import { create } from 'zustand';
import { Platform } from 'react-native';
import { ThemeMode } from '@/types/models';

interface UIState {
  theme: ThemeMode;
  isOnline: boolean;
  isSyncing: boolean;
  snackbar: { visible: boolean; message: string; type: 'success' | 'error' | 'info' } | null;
  activeBottomSheet: string | null;

  setTheme: (theme: ThemeMode) => void;
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  showSnackbar: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideSnackbar: () => void;
  openBottomSheet: (id: string) => void;
  closeBottomSheet: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  isOnline: Platform.OS !== 'web', // no real backend reachable from browser (CORS)
  isSyncing: false,
  snackbar: null,
  activeBottomSheet: null,

  setTheme: (theme) => set({ theme }),
  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),

  showSnackbar: (message, type = 'info') =>
    set({ snackbar: { visible: true, message, type } }),

  hideSnackbar: () =>
    set((state) => ({
      snackbar: state.snackbar ? { ...state.snackbar, visible: false } : null,
    })),

  openBottomSheet: (id) => set({ activeBottomSheet: id }),
  closeBottomSheet: () => set({ activeBottomSheet: null }),
}));

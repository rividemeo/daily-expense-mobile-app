import { create } from 'zustand';
import { Category, TransactionType } from '@/types/models';
import { ALL_DEFAULT_CATEGORIES } from '@/shared/constants/categories';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;

  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setLoading: (loading: boolean) => void;
  getCategoriesByType: (type: TransactionType) => Category[];
  getCategoryById: (id: string) => Category | undefined;
}

const now = new Date().toISOString();
const initialCategories: Category[] = ALL_DEFAULT_CATEGORIES.map((c) => ({
  ...c,
  createdAt: now,
  updatedAt: now,
}));

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: initialCategories,
  isLoading: false,

  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id || c.isDefault),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  getCategoriesByType: (type) => get().categories.filter((c) => c.type === type),

  getCategoryById: (id) => get().categories.find((c) => c.id === id),
}));

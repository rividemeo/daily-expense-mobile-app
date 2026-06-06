import { create } from 'zustand';
import { Budget } from '@/types/models';

interface BudgetState {
  budgets: Budget[];
  selectedBudget: Budget | null;
  isLoading: boolean;

  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setSelectedBudget: (budget: Budget | null) => void;
  setLoading: (loading: boolean) => void;
  updateBudgetSpent: (categoryId: string, amount: number, type: 'add' | 'subtract') => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  selectedBudget: null,
  isLoading: false,

  setBudgets: (budgets) => set({ budgets }),

  addBudget: (budget) =>
    set((state) => ({ budgets: [...state.budgets, budget] })),

  updateBudget: (id, updates) =>
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  deleteBudget: (id) =>
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),

  setSelectedBudget: (selectedBudget) => set({ selectedBudget }),

  setLoading: (isLoading) => set({ isLoading }),

  updateBudgetSpent: (categoryId, amount, type) =>
    set((state) => ({
      budgets: state.budgets.map((b) => {
        if (b.categoryId !== categoryId) return b;
        const newSpent =
          type === 'add' ? b.spent + amount : Math.max(0, b.spent - amount);
        return { ...b, spent: newSpent };
      }),
    })),
}));

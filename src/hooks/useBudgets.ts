import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useBudgetStore } from '@/stores/budgetStore';
import {
  getBudgets,
  insertBudget,
  updateBudget,
  deleteBudget,
} from '@/services/database/repositories/budgetRepository';
import { Budget } from '@/types/models';
import { sumExpenses } from '@/services/database/repositories/transactionRepository';
import { getWeekRange } from '@/shared/utils/formatDate';
import { usePaydayMonth, usePaydayYear } from './usePayday';
import { useUIStore } from '@/stores/uiStore';

export function useBudgetsQuery() {
  const user = useAuthStore((s) => s.user);
  const { setBudgets } = useBudgetStore();
  const month = usePaydayMonth();
  const year = usePaydayYear();

  return useQuery({
    queryKey: ['budgets', user?.id, month.startDate, year.startDate],
    queryFn: async () => {
      // Offline-only app: budgets live in the phone's database, never fetched from a server.
      // "Spent" is worked out fresh for the current period, so every payday month starts at zero.
      const stored: Budget[] = await getBudgets(user?.id ?? '');
      const budgets = await Promise.all(
        stored.map(async (b) => {
          const r = b.period === 'weekly' ? getWeekRange() : b.period === 'yearly' ? year : month;
          return { ...b, spent: await sumExpenses(user?.id ?? '', r.startDate, r.endDate, b.categoryId) };
        }),
      );
      setBudgets(budgets);
      return budgets;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { addBudget } = useBudgetStore();
  const { showSnackbar } = useUIStore();

  return useMutation({
    mutationFn: async (data: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const budget: Budget = {
        ...data,
        id: `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        spent: 0,
        userId: user?.id ?? '',
        createdAt: now,
        updatedAt: now,
      };
      await insertBudget(budget);
      addBudget(budget);
      return budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSnackbar('Budget created', 'success');
    },
    onError: () => {
      showSnackbar('Failed to create budget', 'error');
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { deleteBudget: deleteStore } = useBudgetStore();
  const { showSnackbar } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBudget(id);
      deleteStore(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSnackbar('Budget deleted', 'success');
    },
  });
}

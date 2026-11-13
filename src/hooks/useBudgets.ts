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
import { useUIStore } from '@/stores/uiStore';

export function useBudgetsQuery() {
  const user = useAuthStore((s) => s.user);
  const { setBudgets } = useBudgetStore();

  return useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      // Offline-only app: budgets live in the phone's database, never fetched from a server.
      const budgets: Budget[] = await getBudgets(user?.id ?? '');
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

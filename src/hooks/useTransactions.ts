import { Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import {
  getTransactions,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyStats,
} from '@/services/database/repositories/transactionRepository';
import { Transaction } from '@/types/models';
import { TransactionFilters } from '@/types/api';
import { useUIStore } from '@/stores/uiStore';
import { usePaydayMonth } from './usePayday';

// On web, SQLite is not available — all reads come from the Zustand store.
// On native, TanStack Query drives reads from SQLite / API.

export function useTransactionsQuery(filters: TransactionFilters = {}) {
  const user = useAuthStore((s) => s.user);
  const storeTransactions = useTransactionStore((s) => s.transactions);

  // Keep query around so the return shape is consistent, but disable it on web
  const query = useQuery({
    queryKey: ['transactions', user?.id, filters],
    // Offline-only app: transactions live in the phone's database, never fetched from a server.
    queryFn: () => getTransactions(user?.id ?? '', filters),
    enabled: !!user && Platform.OS !== 'web',
    staleTime: 2 * 60 * 1000,
  });

  if (Platform.OS === 'web') {
    let filtered = [...storeTransactions];
    if (filters.type) filtered = filtered.filter((t) => t.type === filters.type);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(s) ||
          (t.notes ?? '').toLowerCase().includes(s)
      );
    }
    if (filters.startDate) filtered = filtered.filter((t) => t.date >= filters.startDate!);
    if (filters.endDate) filtered = filtered.filter((t) => t.date <= filters.endDate!);
    if (filters.categoryId) filtered = filtered.filter((t) => t.categoryId === filters.categoryId);
    filtered.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    if (filters.pageSize) filtered = filtered.slice(0, filters.pageSize);
    return { ...query, data: filtered, isLoading: false, isPending: false, isError: false };
  }

  return query;
}

export function useMonthlyStats() {
  const user = useAuthStore((s) => s.user);
  const storeTransactions = useTransactionStore((s) => s.transactions);
  // "This month" is the payday month: from the salary that pays for it to the day before the next.
  const { startDate, endDate } = usePaydayMonth();

  const query = useQuery({
    queryKey: ['monthly-stats', user?.id, startDate, endDate],
    queryFn: () => getMonthlyStats(user?.id ?? '', startDate, endDate),
    enabled: !!user && Platform.OS !== 'web',
    staleTime: 5 * 60 * 1000,
  });

  if (Platform.OS === 'web') {
    const monthTx = storeTransactions.filter((t) => t.date.slice(0, 10) >= startDate && t.date.slice(0, 10) <= endDate);
    const totalIncome = monthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return { ...query, data: { totalIncome, totalExpenses }, isLoading: false };
  }

  return query;
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();
  const { addTransaction } = useTransactionStore();

  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>) => {
      const now = new Date().toISOString();
      const transaction: Transaction = {
        ...data,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        isSynced: false,
      };
      await insertTransaction(transaction); // no-op on web
      addTransaction(transaction);
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSnackbar('Transaction added', 'success');
    },
    onError: () => {
      showSnackbar('Failed to add transaction', 'error');
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { updateTransaction: updateStore } = useTransactionStore();
  const { showSnackbar } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      await updateTransaction(id, data); // no-op on web
      updateStore(id, data);
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSnackbar('Transaction updated', 'success');
    },
    onError: () => {
      showSnackbar('Failed to update transaction', 'error');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { deleteTransaction: deleteStore } = useTransactionStore();
  const { showSnackbar } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteTransaction(id); // no-op on web
      deleteStore(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSnackbar('Transaction deleted', 'success');
    },
    onError: () => {
      showSnackbar('Failed to delete transaction', 'error');
    },
  });
}

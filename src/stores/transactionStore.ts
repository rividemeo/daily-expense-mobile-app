import { create } from 'zustand';
import { Transaction } from '@/types/models';
import { TransactionFilters } from '@/types/api';

interface TransactionState {
  transactions: Transaction[];
  filters: TransactionFilters;
  selectedTransaction: Transaction | null;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  setSelectedTransaction: (transaction: Transaction | null) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  markAsSynced: (ids: string[]) => void;
}

const DEFAULT_FILTERS: TransactionFilters = {
  page: 1,
  pageSize: 20,
};

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  filters: DEFAULT_FILTERS,
  selectedTransaction: null,
  isLoading: false,
  hasMore: true,
  page: 1,

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    })),

  clearFilters: () => set({ filters: DEFAULT_FILTERS, page: 1 }),

  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),

  setLoading: (isLoading) => set({ isLoading }),

  setHasMore: (hasMore) => set({ hasMore }),

  setPage: (page) => set({ page }),

  markAsSynced: (ids) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        ids.includes(tx.id) ? { ...tx, isSynced: true } : tx
      ),
    })),
}));

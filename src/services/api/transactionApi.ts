import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, TransactionFilters, ExportRequest } from '@/types/api';
import { Transaction } from '@/types/models';

export const transactionApi = {
  getTransactions: (filters: TransactionFilters = {}) =>
    apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', {
      params: filters,
    }),

  getTransaction: (id: string) =>
    apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`),

  createTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>) =>
    apiClient.post<ApiResponse<Transaction>>('/transactions', data),

  updateTransaction: (id: string, data: Partial<Transaction>) =>
    apiClient.patch<ApiResponse<Transaction>>(`/transactions/${id}`, data),

  deleteTransaction: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/transactions/${id}`),

  duplicateTransaction: (id: string) =>
    apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/duplicate`),

  uploadAttachment: (id: string, formData: FormData) =>
    apiClient.post<ApiResponse<{ url: string }>>(`/transactions/${id}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  exportTransactions: (data: ExportRequest) =>
    apiClient.post('/transactions/export', data, { responseType: 'blob' }),

  syncTransactions: (transactions: Transaction[]) =>
    apiClient.post<ApiResponse<{ synced: string[]; conflicts: string[] }>>(
      '/transactions/sync',
      { transactions }
    ),
};

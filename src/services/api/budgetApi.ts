import { apiClient } from './client';
import { ApiResponse } from '@/types/api';
import { Budget } from '@/types/models';

export const budgetApi = {
  getBudgets: () =>
    apiClient.get<ApiResponse<Budget[]>>('/budgets'),

  createBudget: (data: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<Budget>>('/budgets', data),

  updateBudget: (id: string, data: Partial<Budget>) =>
    apiClient.patch<ApiResponse<Budget>>(`/budgets/${id}`, data),

  deleteBudget: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/budgets/${id}`),
};

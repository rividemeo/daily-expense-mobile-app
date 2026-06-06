import { apiClient } from './client';
import { ApiResponse } from '@/types/api';
import { Category } from '@/types/models';

export const categoryApi = {
  getCategories: () =>
    apiClient.get<ApiResponse<Category[]>>('/categories'),

  createCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),

  updateCategory: (id: string, data: Partial<Category>) =>
    apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/categories/${id}`),
};

import { apiClient } from './client';
import { Category, CreateCategoryPayload } from '../types/category.types';

export const categoriesApi = {
  getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories');
  },

  getCategory(categoryId: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${categoryId}`);
  },

  createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return apiClient.post<Category>('/categories', payload);
  },

  updateCategory(categoryId: string, payload: Partial<CreateCategoryPayload>): Promise<Category> {
    return apiClient.put<Category>(`/categories/${categoryId}`, payload);
  },

  deleteCategory(categoryId: string): Promise<void> {
    return apiClient.delete<void>(`/categories/${categoryId}`);
  },

  getCategoryStats(categoryId: string, month?: string): Promise<{ spent: number; budget: number; count: number }> {
    const query = month ? `?month=${month}` : '';
    return apiClient.get(`/categories/${categoryId}/stats${query}`);
  },
};
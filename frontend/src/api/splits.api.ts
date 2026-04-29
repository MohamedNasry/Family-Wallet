import { apiClient } from './client';
import { Split, CreateSplitPayload, SplitSummary } from '../types/split.types';

export const splitsApi = {
  getSplitsForBill(billId: string): Promise<Split[]> {
    return apiClient.get<Split[]>(`/bills/${billId}/splits`);
  },

  createSplit(billId: string, payload: CreateSplitPayload): Promise<Split[]> {
    return apiClient.post<Split[]>(`/bills/${billId}/splits`, payload);
  },

  updateSplit(splitId: string, amount: number): Promise<Split> {
    return apiClient.patch<Split>(`/splits/${splitId}`, { amount });
  },

  markSplitPaid(splitId: string): Promise<Split> {
    return apiClient.patch<Split>(`/splits/${splitId}/pay`, {});
  },

  getMySplitSummary(): Promise<SplitSummary> {
    return apiClient.get<SplitSummary>('/splits/summary/me');
  },

  getFamilySplitSummary(): Promise<SplitSummary[]> {
    return apiClient.get<SplitSummary[]>('/splits/summary/family');
  },
};
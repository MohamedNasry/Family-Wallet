import { apiClient } from './client';
import { Bill, CreateBillPayload, UpdateBillPayload } from '../types/bill.types';
import { OcrResult } from '../types/ocr.types';

export const billsApi = {
  getBills(params?: {
    page?: number;
    limit?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ bills: Bill[]; total: number; page: number }> {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined) acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return apiClient.get(`/bills${query ? `?${query}` : ''}`);
  },

  getBill(billId: string): Promise<Bill> {
    return apiClient.get<Bill>(`/bills/${billId}`);
  },

  createBill(payload: CreateBillPayload): Promise<Bill> {
    return apiClient.post<Bill>('/bills', payload);
  },

  updateBill(billId: string, payload: UpdateBillPayload): Promise<Bill> {
    return apiClient.put<Bill>(`/bills/${billId}`, payload);
  },

  deleteBill(billId: string): Promise<void> {
    return apiClient.delete<void>(`/bills/${billId}`);
  },

  scanReceipt(imageUri: string): Promise<OcrResult> {
    const formData = new FormData();
    formData.append('receipt', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as unknown as Blob);
    return apiClient.postFormData<OcrResult>('/bills/scan', formData);
  },

  confirmOcr(ocrResultId: string, correctedData: Partial<OcrResult>): Promise<Bill> {
    return apiClient.post<Bill>('/bills/ocr-confirm', { ocrResultId, ...correctedData });
  },
};
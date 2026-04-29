import { apiRequest } from "./client";
import type { Bill } from "../types/bill.types";
import type { BillSplit } from "../types/split.types";

export type CreateBillRequest = {
  title: string;
  totalAmount: number | string;
  currency: string;
  billDate?: string | null;
  categoryId?: number | null;
  notes?: string;
};

export type ListBillsResponse = { success: boolean; bills: Bill[] };
export type CreateBillResponse = { success: boolean; bill: Bill };
export type GetBillResponse = { success: boolean; bill: Bill };
export type GetBillSplitsResponse = { success: boolean; splits: BillSplit[] };

export const listBillsApi = async (): Promise<ListBillsResponse> => {
  return apiRequest<ListBillsResponse>("/api/bills", { method: "GET" });
};

export const getBillApi = async (billId: number | string): Promise<GetBillResponse> => {
  return apiRequest<GetBillResponse>(`/api/bills/${billId}`, { method: "GET" });
};

export const createBillApi = async (
  payload: CreateBillRequest
): Promise<CreateBillResponse> => {
  return apiRequest<CreateBillResponse>("/api/bills", {
    method: "POST",
    body: payload,
  });
};

export const getBillSplitsApi = async (
  billId: number | string
): Promise<GetBillSplitsResponse> => {
  return apiRequest<GetBillSplitsResponse>(`/api/bills/${billId}/splits`, {
    method: "GET",
  });
};


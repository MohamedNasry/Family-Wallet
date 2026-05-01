import { apiRequest } from "./client";
import type {
  BillsResponse,
  BillsSummaryResponse,
  OcrProcessResponse,
  ConfirmOcrPayload,
  ConfirmOcrResponse,
  SplitBillPayload,
  SplitBillResponse,
  CreateBillPayload,
  CreateBillResponse,
} from "../types/bill.types";

export const getBillsApi = async (): Promise<BillsResponse> => {
  return apiRequest<BillsResponse>("/api/bills?limit=5", {
    method: "GET",
  });
};

export const getBillsSummaryApi = async (): Promise<BillsSummaryResponse> => {
  return apiRequest<BillsSummaryResponse>("/api/bills/summary", {
    method: "GET",
  });
};

export const processBillOcrApi = async (
  formData: FormData
): Promise<OcrProcessResponse> => {
  return apiRequest<OcrProcessResponse>("/api/bills/ocr", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
};

export const confirmOcrBillApi = async (
  ocrId: number,
  payload: ConfirmOcrPayload
): Promise<ConfirmOcrResponse> => {
  return apiRequest<ConfirmOcrResponse>(`/api/bills/ocr/${ocrId}/confirm`, {
    method: "POST",
    body: payload,
  });
};



export const createBillApi = async (
  payload: CreateBillPayload
): Promise<CreateBillResponse> => {
  return apiRequest<CreateBillResponse>("/api/bills", {
    method: "POST",
    body: payload,
  });
};

export const splitBillApi = async (
  billId: number,
  payload: SplitBillPayload
): Promise<SplitBillResponse> => {
  return apiRequest<SplitBillResponse>(`/api/bills/${billId}/split`, {
    method: "POST",
    body: payload,
  });
};

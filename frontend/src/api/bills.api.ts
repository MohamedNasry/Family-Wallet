import { apiRequest } from "./client";
import type {
  BillsResponse,
  BillsSummaryResponse,
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

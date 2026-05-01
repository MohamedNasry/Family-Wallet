import { apiRequest } from "./client";
import type {
  BankAccountsResponse,
  CreateBankAccountPayload,
  CreateBankAccountResponse,
  ChargePayload,
  RefundPayload,
  BankOperationResponse,
} from "../types/bank.types";

export const getBankAccountsApi = async (
  userId: number
): Promise<BankAccountsResponse> => {
  return apiRequest<BankAccountsResponse>(`/api/mock-bank/accounts/${userId}`, {
    method: "GET",
  });
};

export const createBankAccountApi = async (
  payload: CreateBankAccountPayload
): Promise<CreateBankAccountResponse> => {
  return apiRequest<CreateBankAccountResponse>("/api/mock-bank/accounts", {
    method: "POST",
    body: payload,
  });
};

export const chargeBankAccountApi = async (
  payload: ChargePayload
): Promise<BankOperationResponse> => {
  return apiRequest<BankOperationResponse>("/api/mock-bank/charge", {
    method: "POST",
    body: payload,
  });
};

export const refundBankAccountApi = async (
  payload: RefundPayload
): Promise<BankOperationResponse> => {
  return apiRequest<BankOperationResponse>("/api/mock-bank/refund", {
    method: "POST",
    body: payload,
  });
};
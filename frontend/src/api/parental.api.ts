import { apiRequest } from "./client";
import type {
  ParentalApprovalsResponse,
  UpdateBlockedCategoryResponse,
  BlockedCategoriesResponse,
} from "../types/parental.types";

export const getParentalApprovalsApi = async (
  status: "PENDING" | "APPROVED" | "DECLINED" | "ALL" = "PENDING"
): Promise<ParentalApprovalsResponse> => {
  return apiRequest<ParentalApprovalsResponse>(
    `/api/parental/approvals?status=${status}`,
    {
      method: "GET",
    }
  );
};

export const approveParentalApprovalApi = async (
  approvalId: number
): Promise<any> => {
  return apiRequest(`/api/parental/approvals/${approvalId}/approve`, {
    method: "PATCH",
    body: {},
  });
};

export const declineParentalApprovalApi = async (
  approvalId: number,
  reason?: string
): Promise<any> => {
  return apiRequest(`/api/parental/approvals/${approvalId}/decline`, {
    method: "PATCH",
    body: {
      reason: reason || null,
    },
  });
};

export const getBlockedCategoriesApi =
  async (): Promise<BlockedCategoriesResponse> => {
    return apiRequest<BlockedCategoriesResponse>(
      "/api/parental/blocked-categories",
      {
        method: "GET",
      }
    );
  };

export const updateBlockedCategoryApi = async (
  categoryId: number,
  blocked: boolean
): Promise<UpdateBlockedCategoryResponse> => {
  return apiRequest<UpdateBlockedCategoryResponse>(
    `/api/parental/blocked-categories/${categoryId}`,
    {
      method: "PATCH",
      body: {
        blocked,
      },
    }
  );
};
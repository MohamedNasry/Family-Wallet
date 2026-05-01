import { apiRequest } from "./client";
import type {
  ChildPointsResponse,
  PointTransactionsResponse,
  SpendPointsPayload,
  SpendPointsResponse,
  TopUpPointsPayload,
  TopUpPointsResponse,
} from "../types/points.types";

export const getChildPointsApi = async (
  childId: number
): Promise<ChildPointsResponse> => {
  return apiRequest<ChildPointsResponse>(`/api/children-points/${childId}`, {
    method: "GET",
  });
};

export const getChildPointTransactionsApi = async (
  childId: number
): Promise<PointTransactionsResponse> => {
  return apiRequest<PointTransactionsResponse>(
    `/api/children-points/${childId}/transactions`,
    {
      method: "GET",
    }
  );
};

export const spendPointsApi = async (
  payload: SpendPointsPayload
): Promise<SpendPointsResponse> => {
  return apiRequest<SpendPointsResponse>("/api/children-points/spend", {
    method: "POST",
    body: payload,
  });
};

export const topUpPointsApi = async (
  payload: TopUpPointsPayload
): Promise<TopUpPointsResponse> => {
  return apiRequest<TopUpPointsResponse>("/api/children-points/topup", {
    method: "POST",
    body: payload,
  });
};
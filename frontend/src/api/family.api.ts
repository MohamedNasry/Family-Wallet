import { apiRequest } from "./client";
import type {
  FamilyMembersResponse,
  FamilyMembersStatsResponse,
  MyFamilyResponse,
} from "../types/family.types";

export const getMyFamilyApi = async (): Promise<MyFamilyResponse> => {
  return apiRequest<MyFamilyResponse>("/api/families/my-family", {
    method: "GET",
  });
};

export const getFamilyMembersApi = async (
  familyId: number
): Promise<FamilyMembersResponse> => {
  return apiRequest<FamilyMembersResponse>(
    `/api/families/${familyId}/members`,
    {
      method: "GET",
    }
  );
};

export const getFamilyMembersStatsApi = async (
  familyId: number
): Promise<FamilyMembersStatsResponse> => {
  return apiRequest<FamilyMembersStatsResponse>(
    `/api/families/${familyId}/members/stats`,
    {
      method: "GET",
    }
  );
};

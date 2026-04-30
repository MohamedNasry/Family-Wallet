import { apiRequest } from "./client";
import type { MyFamilyResponse, FamilyMembersResponse  } from "../types/family.types";

export const getMyFamilyApi = async (): Promise<MyFamilyResponse> => {
  return apiRequest<MyFamilyResponse>("/api/families/my-family", {
    method: "GET",
  });}

export const getFamilyMembersApi = async (
  familyId: number
): Promise<FamilyMembersResponse> => {
  return apiRequest<FamilyMembersResponse>(`/api/families/${familyId}/members`, {
    method: "GET",
  });

};
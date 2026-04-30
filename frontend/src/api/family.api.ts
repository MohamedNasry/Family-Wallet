import { apiRequest } from "./client";
import type { MyFamilyResponse } from "../types/family.types";

export const getMyFamilyApi = async (): Promise<MyFamilyResponse> => {
  return apiRequest<MyFamilyResponse>("/api/families/my-family", {
    method: "GET",
  });
};
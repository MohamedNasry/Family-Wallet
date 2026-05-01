import { apiRequest } from "./client";
import type { MySplitsResponse } from "../types/split.types";

export const getMySplitsApi = async (): Promise<MySplitsResponse> => {
  return apiRequest<MySplitsResponse>("/api/splits/my", {
    method: "GET",
  });

//   export const paySplitApi = async (
//     splitId: number
//   ): Promise<{
//     success: boolean;
//     message: string;
//     split?: any;
//     bill?: any;
//   }> => {
//     return apiRequest(`/api/splits/${splitId}/pay`, {
//       method: "PATCH",
//     });
};
import { apiRequest } from "./client";
import type { CategoriesResponse } from "../types/category.types";

export const getCategoriesApi = async (): Promise<CategoriesResponse> => {
  return apiRequest<CategoriesResponse>("/api/categories", {
    method: "GET",
  });
};
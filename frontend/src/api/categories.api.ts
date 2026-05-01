import { apiRequest } from "./client";
import type { CategoriesResponse, Category } from "../types/category.types";

export const getCategoriesApi = async (): Promise<CategoriesResponse> => {
  return apiRequest<CategoriesResponse>("/api/categories", {
    method: "GET",
  });
};

export const createCategoryApi = async (payload: {
  name: string;
  isHarmful: boolean;
}): Promise<{
  success: boolean;
  message: string;
  category: Category;
}> => {
  return apiRequest("/api/categories", {
    method: "POST",
    body: payload,
  });
};
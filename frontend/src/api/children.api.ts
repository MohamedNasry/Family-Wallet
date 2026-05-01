import { apiRequest } from "./client";

export type Child = {
  userId: number;
  fullName: string;
  email?: string;
  role: "CHILD";
};

export type MyChildrenResponse = {
  success: boolean;
  children: Child[];
};

export const getMyChildrenApi = async (): Promise<MyChildrenResponse> => {
  return apiRequest<MyChildrenResponse>("/api/children/my", {
    method: "GET",
  });
};
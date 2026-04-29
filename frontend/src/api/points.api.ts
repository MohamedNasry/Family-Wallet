import { apiRequest } from "./client";
export type PointsWalletResponse = {
  success: boolean;
  wallet: {
    balance: number;
    updatedAt?: string;
  };
};

export const getPointsWalletApi = async (): Promise<PointsWalletResponse> =>
  apiRequest<PointsWalletResponse>("/api/points/wallet", { method: "GET" });


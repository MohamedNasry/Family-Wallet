import { apiClient } from './client';

export interface PointsBalance {
  total: number;
  available: number;
  pending: number;
}

export interface PointTransaction {
  id: string;
  amount: number;
  reason: string;
  type: 'earn' | 'redeem';
  createdAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
  category: string;
}

export const pointsApi = {
  getMyBalance(): Promise<PointsBalance> {
    return apiClient.get<PointsBalance>('/points/balance');
  },

  getMemberBalance(memberId: string): Promise<PointsBalance> {
    return apiClient.get<PointsBalance>(`/points/balance/${memberId}`);
  },

  getTransactionHistory(params?: { page?: number; limit?: number }): Promise<{
    transactions: PointTransaction[];
    total: number;
  }> {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined) acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return apiClient.get(`/points/history${query ? `?${query}` : ''}`);
  },

  getRewards(): Promise<Reward[]> {
    return apiClient.get<Reward[]>('/points/rewards');
  },

  redeemReward(rewardId: string): Promise<{ success: boolean; remaining: number }> {
    return apiClient.post('/points/redeem', { rewardId });
  },

  awardPoints(memberId: string, amount: number, reason: string): Promise<PointTransaction> {
    return apiClient.post('/points/award', { memberId, amount, reason });
  },
};
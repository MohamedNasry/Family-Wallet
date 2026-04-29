export type SplitMethod = 'equal' | 'percentage' | 'custom';
export type SplitStatus = 'pending' | 'paid';

export interface SplitMember {
  memberId: string;
  memberName: string;
  amount?: number;
  percentage?: number;
}

export interface Split {
  id: string;
  billId: string;
  memberId: string;
  memberName: string;
  amount: number;
  status: SplitStatus;
  paidAt?: string;
  createdAt: string;
}

export interface CreateSplitPayload {
  method: SplitMethod;
  members: SplitMember[];
}

export interface SplitSummary {
  memberId: string;
  memberName: string;
  totalOwed: number;
  totalPaid: number;
  balance: number;
}
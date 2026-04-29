export type BillStatus = 'pending' | 'paid' | 'partial' | 'cancelled';

export interface Bill {
  id: string;
  title: string;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  paidById: string;
  paidByName: string;
  status: BillStatus;
  note?: string;
  receiptImageUrl?: string;
  familyId: string;
  createdAt: string;
  updatedAt: string;
  splitCount: number;
}

export interface CreateBillPayload {
  title: string;
  amount: number;
  currency: string;
  categoryId: string;
  paidById: string;
  note?: string;
  receiptImageUrl?: string;
}

export interface UpdateBillPayload extends Partial<CreateBillPayload> {
  status?: BillStatus;
}
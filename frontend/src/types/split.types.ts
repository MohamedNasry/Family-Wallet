export type SplitType = "EQUAL" | "PERCENTAGE" | "FIXED";
export type SplitStatus = "UNPAID" | "PAID";

export type BillSplit = {
  splitId: number;
  billId: number;
  userId: number;
  fullName?: string;
  email?: string;
  splitType: SplitType;
  percentage: number | null;
  fixedAmount: number | null;
  amountDue: string | number;
  status: SplitStatus;
};

export type SplitParticipant = {
  userId: number;
  percentage?: number;
  fixedAmount?: number;
};
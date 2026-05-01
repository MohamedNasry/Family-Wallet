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

export type MySplit = {
  splitId: number;
  billId: number;
  billTitle: string;
  billTotal: number;
  currency: string;
  billStatus: string;
  categoryName: string | null;
  userId: number;
  userName: string;
  splitType: "EQUAL" | "PERCENTAGE" | "FIXED";
  percentage: number | null;
  fixedAmount: number | null;
  amountDue: number;
  status: "UNPAID" | "PAID";
  billDate?: string | null;
  createdAt?: string;
};

export type MySplitsResponse = {
  success: boolean;
  count: number;
  splits: MySplit[];
};
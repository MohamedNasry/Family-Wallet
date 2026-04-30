export type BillSource = "MANUAL" | "AI_IMAGE" | "OCR";
export type BillStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Bill = {
  billId: number;
  walletId: number;
  createdBy: number;
  createdByName?: string;
  categoryId: number | null;
  categoryName?: string;
  isHarmful?: boolean;
  title: string;
  totalAmount: string | number;
  currency: string;
  source: BillSource;
  imageUrl: string | null;
  status: BillStatus;
  billDate: string | null;
  createdAt: string;
};

export type RecentTransaction = {
  billId: number;
  title: string;
  totalAmount: number;
  currency: string;
  source: BillSource;
  status: BillStatus;
  billDate: string | null;
  createdAt: string;
  createdByName?: string;
  categoryName?: string;
};

export type SpendingByCategory = {
  categoryId: number | null;
  categoryName: string;
  isHarmful: boolean;
  totalAmount: number;
  billCount: number;
};

export type BillsSummary = {
  totalExpenses: number;
  totalBills: number;
  monthlyExpenses: number;
  monthlyBills: number;
  paidAmount: number;
  unpaidAmount: number;
  paidSplits: number;
  unpaidSplits: number;
  monthlyBudget: number | null;
  remainingBudget: number | null;
  budgetUsedPercentage: number | null;
  spendingByCategory: SpendingByCategory[];
  recentTransactions: RecentTransaction[];
};

export type BillsResponse = {
  success: boolean;
  count: number;
  bills: Bill[];
};

export type BillsSummaryResponse = {
  success: boolean;
  summary: BillsSummary;
};
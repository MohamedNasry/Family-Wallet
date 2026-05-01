export type BillSource = "MANUAL" | "AI_IMAGE" | "OCR";
export type BillStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Bill = {
  billId: number;
  walletId: number;
  createdBy: number;
  createdByName?: string;
  categoryId: number | null;
  categoryName?: string;
  title: string;
  totalAmount: number | string;
  currency: string;
  source: BillSource;
  imageUrl?: string | null;
  status: BillStatus;
  billDate?: string | null;
  createdAt?: string;
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

export type OcrDraft = {
  ocrId: number;
  walletId: number;
  userId: number;
  imageUrl: string;
  extractedText: string;
  extractedTitle: string | null;
  extractedTotal: string | null;
  extractedCurrency: string | null;
  extractedBillDate: string | null;
  confirmed: boolean;
  createdAt: string;
};

export type OcrProcessResponse = {
  success: boolean;
  message: string;
  ocrDraft: {
    ocrId: number;
    walletId: number;
    userId: number;
    imageUrl: string;
    extractedText: string;
    extractedTitle: string | null;
    extractedTotal: string | null;
    extractedCurrency: string | null;
    extractedBillDate: string | null;
    confirmed: boolean;
    createdAt: string;
  };
  extractedData: {
    title: string;
    totalAmount: number | null;
    currency: string | null;
    billDate: string | null;
    categoryId: number | null;
  };
};
export type ConfirmOcrPayload = {
  title: string;
  totalAmount: number;
  currency: string;
  categoryId: number | null;
  billDate: string | null;
};

export type ConfirmOcrResponse = {
  success: boolean;
  message: string;
  bill: Bill;
};

export type CreateBillPayload = {
  title: string;
  totalAmount: number;
  currency: string;
  categoryId: number | null;
  billDate: string | null;
  paidByUserId?: number | null;
  items?: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type CreateBillResponse = {
  success: boolean;
  message: string;
  bill: Bill;
};


export type SplitBillPayload =
  | {
      splitType: "EQUAL";
      participants: {
        userId: number;
      }[];
    }
  | {
      splitType: "PERCENTAGE";
      participants: {
        userId: number;
        percentage: number;
      }[];
    }
  | {
      splitType: "FIXED";
      participants: {
        userId: number;
        fixedAmount: number;
      }[];
    };

export type SplitBillResponse = {
  success: boolean;
  message: string;
  splits: any[];
};
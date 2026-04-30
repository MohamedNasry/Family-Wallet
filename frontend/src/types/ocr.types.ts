export type OcrDraft = {
    ocrId: number;
    walletId: number;
    userId: number;
    imageUrl: string;
    extractedText: string;
    extractedTitle: string;
    extractedTotal: string | null;
    extractedCurrency: string;
    extractedBillDate: string | null;
    confirmed: boolean;
    createdAt: string;
  };
  
  export type ExtractedBillData = {
    title: string;
    totalAmount: number | null;
    currency: string;
    billDate: string | null;
    categoryId: number | null;
  };
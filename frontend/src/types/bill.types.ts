export type BillSource = "MANUAL" | "OCR";
export type BillStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Bill = {
  billId: number;
  walletId: number;
  createdBy: number;
  categoryId: number | null;
  title: string;
  totalAmount: string | number;
  currency: string;
  source: BillSource;
  imageUrl: string | null;
  status: BillStatus;
  billDate: string | null;
  createdAt: string;
};

export type BillItem = {
  itemId?: number;
  billId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
};
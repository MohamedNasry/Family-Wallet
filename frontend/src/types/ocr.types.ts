export interface OcrLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OcrResult {
  id: string;
  merchantName?: string;
  totalAmount?: number;
  currency?: string;
  date?: string;
  lineItems: OcrLineItem[];
  rawText: string;
  confidence: number;
  imageUrl: string;
  status: 'processing' | 'completed' | 'failed';
}
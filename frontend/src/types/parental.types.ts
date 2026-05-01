export type ApprovalStatus = "PENDING" | "APPROVED" | "DECLINED";

export type ParentalApproval = {
  approvalId: number;
  walletId: number;
  childId: number;
  childName: string;
  categoryId: number | null;
  categoryName: string | null;
  title: string;
  amount: number;
  currency: string;
  status: ApprovalStatus;
  requestedAt: string;
  reviewedBy?: number | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  declineReason?: string | null;
};

export type ParentalApprovalsResponse = {
  success: boolean;
  count: number;
  approvals: ParentalApproval[];
};

export type BlockedCategory = {
  categoryId: number;
  name: string;
  isHarmful: boolean;
  blocked: boolean;
  updatedAt?: string | null;
};

export type BlockedCategoriesResponse = {
  success: boolean;
  count: number;
  categories: BlockedCategory[];
};

export type UpdateBlockedCategoryResponse = {
  success: boolean;
  message: string;
  category: BlockedCategory;
};
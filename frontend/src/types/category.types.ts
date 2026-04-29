export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  budget?: number;
  spent?: number;
  familyId: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  emoji: string;
  color: string;
  budget?: number;
}
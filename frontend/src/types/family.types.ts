export type Family = {
  familyId: number;
  name: string;
  country: string;
  currency: string;
  createdAt?: string;
};

export type MyFamilyResponse = {
  success: boolean;
  family: Family;
};
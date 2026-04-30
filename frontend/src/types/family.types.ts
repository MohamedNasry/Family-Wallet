import type { User } from "./user.types";

export type FamilyMember = User;

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

export type FamilyMembersResponse = {
  success: boolean;
  members: FamilyMember[];
};
import type { UserRole } from "./user.types";

export type Family = {
  id: number;
  name: string;
  code?: string;
  createdAt?: string;
};

export type FamilyMember = {
  id: number;
  name: string;
  role: UserRole;
  points?: number;
};


import { UserRole } from './user.types';

export interface Family {
  id: string;
  name: string;
  currency: string;
  monthlyBudget?: number;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  pointsBalance: number;
  monthlySpending: number;
  joinedAt: string;
}

export interface InvitePayload {
  email?: string;
  role: UserRole;
  name?: string;
}
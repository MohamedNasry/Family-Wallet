export type Family = {
  familyId: number;
  walletId?: number;
  name: string;
  country: string;
  currency: string;
  createdAt?: string;
};

export type FamilyMember = {
  userId: number;
  walletId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: "PARENT" | "CHILD" | "MEMBER";
  joinedAt?: string;
};


export type FamilyMembersResponse = {
  success: boolean;
  count?: number;
  members: FamilyMember[];
};

export type FamilyMemberContributionStats = {
  userId: number;
  totalContribution?: number;
  contributionPercentage?: number;
  fullName?: string;
};

export type FamilyMembersStatsResponse = {
  success: boolean;
  totalContribution?: number;
  activeMembers?: number;
  topContributorId?: number;
  members?: FamilyMemberContributionStats[];
};

export type MyFamilyResponse = {
  success: boolean;
  family: Family;
};

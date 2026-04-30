export type UserRole = "PARENT" | "CHILD" | "MEMBER";

export type User = {
  userId: number;
  walletId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  joinedAt?: string;
};

export type AuthUserPayload = {
  userId: number;
  walletId: number;
  role: UserRole;
  email: string;
};

export type MeResponse = {
  success: boolean;
  user: User;
};
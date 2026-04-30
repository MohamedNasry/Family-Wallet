import type { User, UserRole } from "./user.types";

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  familyName: string;
  country: string;
  currency: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  user: {
    user_id?: number;
    userId?: number;
    wallet_id?: number;
    walletId?: number;
    full_name?: string;
    fullName?: string;
    email: string;
    role: UserRole;
    joined_at?: string;
    joinedAt?: string;
  };
  wallet: {
    wallet_id?: number;
    walletId?: number;
    name: string;
    country: string;
    currency: string;
    created_at?: string;
    createdAt?: string;
  };
  invite?: {
    invite_id?: number;
    inviteId?: number;
    wallet_id?: number;
    walletId?: number;
    invite_code?: string;
    inviteCode?: string;
    expires_at?: string;
    expiresAt?: string;
    used: boolean;
  };
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  inviteCode?: string | null;
  invite?: {
    invite_id?: number;
    inviteId?: number;
    wallet_id?: number;
    walletId?: number;
    invite_code?: string;
    inviteCode?: string;
    expires_at?: string;
    expiresAt?: string;
    used: boolean;
  } | null;
  user: User;
};

export type JoinWithInviteRequest = {
  fullName: string;
  email: string;
  password: string;
  inviteCode: string;
  role: Exclude<UserRole, "PARENT">;
};

export type JoinWithInviteResponse = {
  success: boolean;
  message: string;
  token: string;
  user: User;
};

export type MeResponse = {
  success: boolean;
  user: User;
};

export type AuthErrorResponse = {
  success: false;
  message: string;
};
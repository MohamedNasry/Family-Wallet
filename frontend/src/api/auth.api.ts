import { apiRequest } from "./client";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  JoinWithInviteRequest,
  JoinWithInviteResponse,
  MeResponse,
} from "../types/auth.types";

export const registerApi = async (
  payload: RegisterRequest
): Promise<RegisterResponse> => {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
};

export const loginApi = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
};

export const joinWithInviteApi = async (
  payload: JoinWithInviteRequest
): Promise<JoinWithInviteResponse> => {
  return apiRequest<JoinWithInviteResponse>("/api/auth/login-with-invite", {
    method: "POST",
    body: payload,
  });
};

export const meApi = async (): Promise<MeResponse> => {
  return apiRequest<MeResponse>("/api/auth/me", {
    method: "GET",
  });
};
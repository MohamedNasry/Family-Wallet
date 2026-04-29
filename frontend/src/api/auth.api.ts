import { apiClient } from './client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  JoinWithInviteRequest,
} from '../types/auth.types';

export const authApi = {
  login(payload: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', payload);
  },

  register(payload: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', payload);
  },

  joinWithInvite(payload: JoinWithInviteRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/join-invite', payload);
  },

  logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout', {});
  },

  refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
  },
};
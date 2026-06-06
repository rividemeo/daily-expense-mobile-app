import { apiClient } from './client';
import {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '@/types/api';
import { User } from '@/types/models';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token }),

  getProfile: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.patch<ApiResponse<User>>('/auth/me', data),

  logout: () => apiClient.post<ApiResponse<{ message: string }>>('/auth/logout'),

  loginWithGoogle: (idToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/google', { idToken }),
};

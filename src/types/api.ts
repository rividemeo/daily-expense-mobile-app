export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface TransactionFilters {
  categoryId?: string;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface BudgetFilters {
  period?: string;
  categoryId?: string;
}

export interface ReportFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

export interface ExportRequest {
  format: 'csv' | 'excel' | 'pdf';
  startDate: string;
  endDate: string;
  categoryIds?: string[];
  type?: 'income' | 'expense';
}

export interface InviteFamilyMemberRequest {
  email: string;
  role: 'member';
}

export interface UpdateProfileRequest {
  name?: string;
  currency?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface UploadAttachmentResponse {
  url: string;
  key: string;
}

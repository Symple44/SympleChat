// src/shared/types/common.ts

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface ErrorResponse {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  name?: string;
  email?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export type LoadingState = {
  isLoading: boolean;
  error: string | null;
};

export type ActionStatus = {
  status: Status;
  error?: string;
  timestamp?: number;
};

export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>;
};

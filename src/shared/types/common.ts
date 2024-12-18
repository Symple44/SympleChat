// src/shared/types/common.ts

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type LoadingState = {
  isLoading: boolean;
  error: string | null;
};

export type Theme = 'light' | 'dark';

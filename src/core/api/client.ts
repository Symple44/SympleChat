// src/core/api/client.ts

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

const getBaseUrl = () => {
  const isDev = import.meta.env.DEV;
  return isDev && import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL 
    : `${window.location.origin}/api`;
};

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl?: string, defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl || getBaseUrl();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...requestInit } = options;

    let fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Ajout des paramètres de requête
    if (params) {
      const url = new URL(fullUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) {
          url.searchParams.append(key, value.toString());
        }
      });
      fullUrl = url.toString();
    }

    try {
      const response = await fetch(fullUrl, {
        ...requestInit,
        headers: {
          ...this.defaultHeaders,
          ...headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error instanceof Error ? error : new Error('Unknown API error');
    }
  }

  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'body' | 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(
    endpoint: string, 
    data?: unknown, 
    options?: Omit<RequestOptions, 'body' | 'method'>
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  public async put<T>(
    endpoint: string, 
    data?: unknown, 
    options?: Omit<RequestOptions, 'body' | 'method'>
  ) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  public async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'body' | 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

export default apiClient;

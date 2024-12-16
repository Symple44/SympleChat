// src/core/api/client.ts

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '', defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...requestInit } = options;

    // Construire l'URL avec les paramètres de requête
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        ...requestInit,
        headers: {
          ...this.defaultHeaders,
          ...headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw {
          status: response.status,
          message: response.statusText,
          data: errorData
        };
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error instanceof Error ? error : new Error('Unknown API error');
    }
  }

  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'body' | 'method'>) {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'GET' 
    });
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
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'DELETE' 
    });
  }
}

// Instance par défaut
export const apiClient = new ApiClient();

export default apiClient;

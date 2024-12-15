// src/core/api/client.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

interface RequestOptions extends RequestInit {
  method?: HttpMethod;
  data?: unknown;
  params?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string, defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', data, params, headers = {} } = options;

    // Construire l'URL avec les paramètres de requête
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw {
          status: response.status,
          message: response.statusText,
          data: errorData
        } as ApiError;
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error instanceof Error ? error : new Error('Unknown API error');
    }
  }

  // Méthodes d'aide pour les requêtes HTTP communes
  public async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method' | 'data'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', data });
  }

  public async put<T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method' | 'data'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', data });
  }

  public async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instance par défaut
export const apiClient = new ApiClient(import.meta.env.VITE_API_URL || '');

export default apiClient;

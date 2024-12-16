// src/core/api/interceptors/auth.ts

interface AuthConfig {
  userId: string;
  tokenKey?: string;
  onAuthError?: (error: Error) => void;
  onTokenExpired?: () => Promise<string>;
}

interface AuthHeaders {
  'X-User-ID': string;
  'Authorization'?: string;
}

export class AuthInterceptor {
  private config: AuthConfig;
  private token: string | null = null;

  constructor(config: AuthConfig) {
    this.config = {
      tokenKey: 'auth_token',
      ...config
    };

    // Charger le token depuis le localStorage si disponible
    this.token = localStorage.getItem(this.config.tokenKey || 'auth_token');
  }

  /**
   * Ajout des headers d'authentification
   */
  getAuthHeaders(): AuthHeaders {
    const headers: AuthHeaders = {
      'X-User-ID': this.config.userId
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Gestion des erreurs d'authentification
   */
  async handleAuthError(response: Response): Promise<Response> {
    // Si le token est expiré (401) et qu'un handler de refresh est défini
    if (response.status === 401 && this.config.onTokenExpired) {
      try {
        // Tentative de refresh du token
        const newToken = await this.config.onTokenExpired();
        this.setToken(newToken);

        // Réessayer la requête originale avec le nouveau token
        const newResponse = await fetch(response.url, {
          ...response,
          headers: {
            ...response.headers,
            ...this.getAuthHeaders()
          }
        });

        return newResponse;
      } catch (error) {
        this.clearToken();
        throw new Error('Session expirée, veuillez vous reconnecter');
      }
    }

    // Autres erreurs d'authentification (403, etc.)
    if (response.status === 403) {
      this.config.onAuthError?.(new Error('Accès non autorisé'));
    }

    return response;
  }

  /**
   * Mise à jour du token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.config.tokenKey || 'auth_token', token);
  }

  /**
   * Suppression du token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem(this.config.tokenKey || 'auth_token');
  }

  /**
   * Vérification de l'état de l'authentification
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Récupération du token actuel
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Mise à jour de l'ID utilisateur
   */
  setUserId(userId: string): void {
    this.config.userId = userId;
  }

  /**
   * Récupération de l'ID utilisateur
   */
  getUserId(): string {
    return this.config.userId;
  }
}

// Instance par défaut avec configuration minimale
export const authInterceptor = new AuthInterceptor({
  userId: 'oweo',
  onAuthError: (error) => {
    console.error('Erreur d\'authentification:', error);
  },
  onTokenExpired: async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Échec du rafraîchissement du token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }
});

export default authInterceptor;

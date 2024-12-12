// src/services/api/client.js
import { API_CONFIG } from '../../config/api.config';

class ApiClient {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...options.headers };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new ApiError(response.status, response.statusText, errorData);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Erreur réseau', error.message);
    }
  }

  // Messages
  async sendMessage(content, sessionId = null) {
    return this.request(API_CONFIG.ENDPOINTS.CHAT, {
      method: 'POST',
      body: JSON.stringify({
        user_id: API_CONFIG.DEFAULT_USER_ID,
        query: content,
        session_id: sessionId,
        language: MESSAGE_CONFIG.DEFAULT_LANGUAGE
      })
    });
  }

  async getMessageHistory(sessionId) {
    return this.request(`${API_CONFIG.ENDPOINTS.HISTORY}/session/${sessionId}`);
  }

  // Sessions
  async createSession() {
    return this.request(`${API_CONFIG.ENDPOINTS.SESSIONS}/new`, {
      method: 'POST',
      params: { user_id: API_CONFIG.DEFAULT_USER_ID }
    });
  }

  async getSession(sessionId) {
    return this.request(`${API_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`);
  }

  async getUserSessions() {
    return this.request(`${API_CONFIG.ENDPOINTS.HISTORY}/user/${API_CONFIG.DEFAULT_USER_ID}`);
  }
}

class ApiError extends Error {
  constructor(status, statusText, data) {
    super(statusText);
    this.status = status;
    this.data = data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

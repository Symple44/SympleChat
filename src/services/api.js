// src/services/api.js
import { config } from '../config';

class ApiClient {
  constructor() {
    this.userId = config.DEFAULT_USER_ID;
    this.baseUrl = config.API_BASE_URL;
    this.sessionId = null;
    console.log('API Client initialized with baseUrl:', this.baseUrl);
  }

  // Configuration headers standards
  get headers() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Méthode helper pour les requêtes
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making API request to:', url);
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.headers
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response body:', text);
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Chat standard
  async sendMessage(message, useStream = false) {
    const payload = {
      user_id: this.userId,
      query: message,
      session_id: this.sessionId,
      language: 'fr',
      context: {}
    };

    if (useStream) {
      return this.streamMessage(payload);
    }

    const response = await this.request('/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return response.json();
  }

  // Chat en streaming
  async *streamMessage(payload) {
    try {
      const response = await this.request('/chat/stream', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = JSON.parse(line.slice(5));
            yield data;
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }

  // Récupération de l'historique
  async getHistory() {
    const response = await this.request(`/chat/history/${this.userId}`);
    return response.json();
  }

  // Vérification de l'état du système
  async checkHealth() {
    const response = await this.request('/health');
    return response.json();
  }
}

export const api = new ApiClient();

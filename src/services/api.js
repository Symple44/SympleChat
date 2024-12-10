// src/services/api.js
const BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.userId = 'oweo'; // User ID par défaut
    this.sessionId = null;
  }

  // Configuration headers standards
  get headers() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Méthode helper pour les requêtes
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: this.headers
      });

      if (!response.ok) {
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
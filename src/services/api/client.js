// services/api/client.js
class ApiClient {
  constructor() {
    this.baseUrl = process.env.VITE_API_URL;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error('API Error');
    }

    return response.json();
  }

  async sendMessage(message) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify(message)
    });
  }

  async getHistory() {
    return this.request('/history');
  }
}

export const apiClient = new ApiClient();
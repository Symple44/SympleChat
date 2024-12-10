// src/services/chatService.js
const chatService = {
  async sendMessage(content) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'oweo',
        query: content,
        language: 'fr'
      })
    });
    
    if (!response.ok) {
      throw new Error('Erreur de communication');
    }
    
    return response.json();
  },

  async getHistory() {
    const response = await fetch('/api/chat/history/oweo');
    if (!response.ok) {
      throw new Error('Erreur de chargement de l\'historique');
    }
    return response.json();
  }
};

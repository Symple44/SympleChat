// src/services/StorageService.js
class StorageService {
  constructor(prefix = 'chat_') {
    this.prefix = prefix;
  }

  // Sauvegarder uniquement les données essentielles
  setMessages(messages) {
    try {
      const simplified = messages.slice(-100).map(msg => ({
        id: msg.id,
        content: msg.content,
        type: msg.type,
        timestamp: msg.timestamp
      }));

      localStorage.setItem(
        `${this.prefix}messages`, 
        JSON.stringify(simplified)
      );
    } catch (error) {
      console.error('Erreur sauvegarde messages:', error);
    }
  }

  getMessages() {
    try {
      const stored = localStorage.getItem(`${this.prefix}messages`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lecture messages:', error);
      return [];
    }
  }

  // Nettoyer le stockage périodiquement
  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const old = keys.filter(key => 
        key.startsWith(this.prefix) && 
        this.isOlderThanOneWeek(key)
      );
      
      old.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erreur nettoyage stockage:', error);
    }
  }

  isOlderThanOneWeek(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      const lastTimestamp = Math.max(
        ...data.map(item => new Date(item.timestamp))
      );
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return lastTimestamp < oneWeekAgo;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
export default storageService;

// src/services/MessageCache.js
class MessageCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 1000;
    this.maxSessionMessages = 100;
  }

  getSessionMessages(sessionId) {
    return this.cache.get(sessionId) || [];
  }

  addMessages(sessionId, messages) {
    // Garder uniquement les messages les plus récents
    const updatedMessages = [...(this.cache.get(sessionId) || []), ...messages]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, this.maxSessionMessages);

    this.cache.set(sessionId, updatedMessages);
    this.enforceCacheLimit();
  }

  updateMessage(sessionId, messageId, updates) {
    const messages = this.cache.get(sessionId);
    if (!messages) return false;

    const index = messages.findIndex(msg => msg.id === messageId);
    if (index === -1) return false;

    messages[index] = { ...messages[index], ...updates };
    this.cache.set(sessionId, messages);
    return true;
  }

  clearSession(sessionId) {
    this.cache.delete(sessionId);
  }

  enforceCacheLimit() {
    if (this.cache.size <= this.maxCacheSize) return;

    // Supprime les sessions les plus anciennes
    const sessionsToRemove = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        const lastMessageA = a[a.length - 1]?.timestamp || 0;
        const lastMessageB = b[b.length - 1]?.timestamp || 0;
        return new Date(lastMessageA) - new Date(lastMessageB);
      })
      .slice(0, this.cache.size - this.maxCacheSize)
      .map(([sessionId]) => sessionId);

    sessionsToRemove.forEach(sessionId => this.cache.delete(sessionId));
  }

  clear() {
    this.cache.clear();
  }
}

export const messageCache = new MessageCache();

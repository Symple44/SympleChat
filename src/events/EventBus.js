// src/services/events/EventBus.js
class EventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistoryLength = 100;
  }

  addEventListener(event, callback, options = {}) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const listener = {
      callback,
      once: options.once || false
    };
    
    this.listeners.get(event).add(listener);
    
    // Retourne une fonction de nettoyage
    return () => {
      this.listeners.get(event)?.delete(listener);
      if (this.listeners.get(event)?.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  emit(event, data) {
    // Enregistrer l'événement dans l'historique
    this.history.push({
      timestamp: Date.now(),
      event,
      data
    });

    // Limiter la taille de l'historique
    if (this.history.length > this.maxHistoryLength) {
      this.history = this.history.slice(-this.maxHistoryLength);
    }

    // Notifier les listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(listener => {
        try {
          listener.callback(data);
          if (listener.once) {
            this.listeners.get(event).delete(listener);
          }
        } catch (error) {
          console.error(`Erreur dans listener pour ${event}:`, error);
        }
      });
    }
  }

  // Écouter une fois
  once(event, callback) {
    return this.addEventListener(event, callback, { once: true });
  }

  // Retirer tous les listeners d'un événement
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // Obtenir l'historique des événements
  getEventHistory(filter = {}) {
    return this.history.filter(entry => {
      return Object.entries(filter).every(([key, value]) => 
        entry[key] === value
      );
    });
  }

  // Vider l'historique
  clearHistory() {
    this.history = [];
  }
}

export const eventBus = new EventBus();

// Types d'événements constants
export const EventTypes = {
  SESSION: {
    CREATED: 'session:created',
    CHANGED: 'session:changed',
    DELETED: 'session:deleted'
  },
  MESSAGE: {
    SENT: 'message:sent',
    RECEIVED: 'message:received',
    FAILED: 'message:failed'
  },
  CONNECTION: {
    CONNECTED: 'connection:connected',
    DISCONNECTED: 'connection:disconnected',
    ERROR: 'connection:error'
  },
  SYSTEM: {
    ERROR: 'system:error',
    WARNING: 'system:warning',
    INFO: 'system:info'
  }
};
// src/services/analytics/AnalyticsService.js
import { config } from '../../config';

class AnalyticsService {
  constructor() {
    this.events = [];
    this.maxEvents = 1000;
    this.isDebugMode = config.DEBUG_MODE;
  }

  trackEvent(category, action, details = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      category,
      action,
      details,
      sessionId: details.sessionId,
      userId: config.CHAT.DEFAULT_USER_ID,
    };

    this.events.push(event);
    this.trimEvents();

    if (this.isDebugMode) {
      console.debug('Analytics Event:', event);
    }

    // On pourrait envoyer les événements à un service externe ici
    this.persistEvent(event);
  }

  trackError(error, context = {}) {
    this.trackEvent('error', 'error_occurred', {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }

  trackPerformance(action, duration, details = {}) {
    this.trackEvent('performance', action, {
      duration,
      ...details
    });
  }

  trimEvents() {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  async persistEvent(event) {
    try {
      // Stockage local pour debug
      const events = JSON.parse(localStorage.getItem('chat_analytics') || '[]');
      events.push(event);
      localStorage.setItem('chat_analytics', JSON.stringify(events.slice(-100)));
    } catch (error) {
      console.error('Erreur stockage analytics:', error);
    }
  }

  getEvents(filter = {}) {
    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => 
        event[key] === value
      );
    });
  }

  clearEvents() {
    this.events = [];
    localStorage.removeItem('chat_analytics');
  }
}

export const analytics = new AnalyticsService();
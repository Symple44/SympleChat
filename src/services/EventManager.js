// src/services/EventManager.js
import { eventBus, EventTypes } from './events/EventBus';
import { performanceMonitor } from './performance/PerformanceMonitor';
import { analytics } from './analytics/AnalyticsService';

class EventManager {
  constructor() {
    this.handlers = new Map();
    this.initialize();
  }

  initialize() {
    // Messages
    this.registerHandler(EventTypes.MESSAGE.SENT, this.handleMessageSent);
    this.registerHandler(EventTypes.MESSAGE.RECEIVED, this.handleMessageReceived);
    this.registerHandler(EventTypes.MESSAGE.FAILED, this.handleMessageFailed);

    // Sessions
    this.registerHandler(EventTypes.SESSION.CREATED, this.handleSessionCreated);
    this.registerHandler(EventTypes.SESSION.CHANGED, this.handleSessionChanged);
    this.registerHandler(EventTypes.SESSION.DELETED, this.handleSessionDeleted);

    // Système
    this.registerHandler(EventTypes.SYSTEM.ERROR, this.handleSystemError);
    this.registerHandler(EventTypes.SYSTEM.WARNING, this.handleSystemWarning);
    this.registerHandler(EventTypes.SYSTEM.INFO, this.handleSystemInfo);

    // Performance
    this.registerHandler(EventTypes.PERFORMANCE.THRESHOLD_EXCEEDED, 
      this.handlePerformanceIssue);

    // UI
    this.registerHandler(EventTypes.UI.THEME_CHANGED, this.handleThemeChanged);
    this.registerHandler(EventTypes.UI.MODAL_OPENED, this.handleModalOpened);
    this.registerHandler(EventTypes.UI.MODAL_CLOSED, this.handleModalClosed);

    console.log('Event Manager initialized');
  }

  registerHandler(eventType, handler) {
    this.handlers.set(eventType, handler.bind(this));
    eventBus.addEventListener(eventType, this.handlers.get(eventType));
  }

  // Gestionnaires d'événements
  async handleMessageSent(event) {
    const { message, sessionId } = event;
    
    performanceMonitor.measureAsync('message_processing', async () => {
      try {
        analytics.trackEvent('message', 'sent', {
          sessionId,
          length: message.content.length,
          hasAttachments: message.documents?.length > 0
        });
      } catch (error) {
        console.error('Error handling message sent:', error);
      }
    });
  }

  handleMessageReceived(event) {
    const { message } = event;
    
    analytics.trackEvent('message', 'received', {
      type: message.type,
      confidence: message.confidence,
      processingTime: message.processingTime
    });
  }

  handleMessageFailed(event) {
    const { error, message } = event;
    
    analytics.trackError('message_failed', {
      error: error.message,
      messageId: message.id
    });
  }

  handleSessionCreated(event) {
    const { sessionId } = event;
    
    analytics.trackEvent('session', 'created', {
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  handleSessionChanged(event) {
    const { sessionId, previousSessionId } = event;
    
    analytics.trackEvent('session', 'changed', {
      sessionId,
      previousSessionId
    });
  }

  handleSessionDeleted(event) {
    const { sessionId } = event;
    
    analytics.trackEvent('session', 'deleted', {
      sessionId
    });
  }

  handleSystemError(event) {
    const { error } = event;
    
    analytics.trackError('system_error', {
      error: error.message,
      stack: error.stack
    });
  }

  handleSystemWarning(event) {
    const { message } = event;
    
    analytics.trackEvent('system', 'warning', {
      message
    });
  }

  handleSystemInfo(event) {
    const { message } = event;
    
    analytics.trackEvent('system', 'info', {
      message
    });
  }

  handlePerformanceIssue(event) {
    const { metric } = event;
    
    analytics.trackEvent('performance', 'issue', {
      metricName: metric.name,
      value: metric.value,
      threshold: metric.threshold
    });
  }

  handleThemeChanged(event) {
    const { theme } = event;
    
    analytics.trackEvent('ui', 'theme_changed', {
      theme
    });
  }

  handleModalOpened(event) {
    const { modalType } = event;
    
    analytics.trackEvent('ui', 'modal_opened', {
      modalType
    });
  }

  handleModalClosed(event) {
    const { modalType } = event;
    
    analytics.trackEvent('ui', 'modal_closed', {
      modalType
    });
  }

  destroy() {
    // Nettoyer les écouteurs d'événements
    this.handlers.forEach((handler, eventType) => {
      eventBus.removeEventListener(eventType, handler);
    });
    this.handlers.clear();
  }
}

export const eventManager = new EventManager();
export default eventManager;

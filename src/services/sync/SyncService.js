// src/services/sync/SyncService.js
import { indexedDBService } from '../storage/IndexedDBService';
import { eventBus, EventTypes } from '../events/EventBus';
import { performanceMonitor } from '../performance/PerformanceMonitor';

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.syncInterval = null;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.listeners = new Set();
  }

  initialize() {
    // Écouter les changements de connectivité
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Démarrer la synchronisation périodique
    this.startPeriodicSync();
  }

  startPeriodicSync(interval = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => this.sync(), interval);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async handleOnline() {
    this.isOnline = true;
    this.retryAttempts = 0;
    eventBus.emit(EventTypes.SYNC.CONNECTIVITY_CHANGED, { status: 'online' });
    await this.sync();
  }

  handleOffline() {
    this.isOnline = false;
    this.stopPeriodicSync();
    eventBus.emit(EventTypes.SYNC.CONNECTIVITY_CHANGED, { status: 'offline' });
  }

  async sync() {
    if (this.isSyncing || !this.isOnline) return;

    const perfMark = performanceMonitor.startMeasure('sync');
    this.isSyncing = true;
    eventBus.emit(EventTypes.SYNC.STARTED);

    try {
      // Synchroniser les actions en attente
      const offlineActions = await indexedDBService.getOfflineQueue();
      
      for (const action of offlineActions) {
        try {
          await this.processOfflineAction(action);
          await indexedDBService.clearOfflineQueue();
        } catch (error) {
          console.error('Erreur synchronisation action:', error);
          if (this.retryAttempts >= this.maxRetries) {
            eventBus.emit(EventTypes.SYNC.FAILED, { 
              action, 
              error: error.message 
            });
            continue;
          }
          this.retryAttempts++;
        }
      }

      // Synchroniser les messages
      await this.syncMessages();

      // Synchroniser les sessions
      await this.syncSessions();

      // Synchroniser les documents
      await this.syncDocuments();

      this.retryAttempts = 0;
      eventBus.emit(EventTypes.SYNC.COMPLETED);
    } catch (error) {
      console.error('Erreur synchronisation:', error);
      eventBus.emit(EventTypes.SYNC.ERROR, { error: error.message });
    } finally {
      this.isSyncing = false;
      performanceMonitor.endMeasure(perfMark);
    }
  }

  async processOfflineAction(action) {
    switch (action.type) {
      case 'SEND_MESSAGE':
        await this.syncMessage(action.payload);
        break;
      case 'CREATE_SESSION':
        await this.syncSession(action.payload);
        break;
      case 'UPDATE_SESSION':
        await this.updateSession(action.payload);
        break;
      default:
        console.warn('Action type inconnu:', action.type);
    }
  }

  async syncMessages() {
    const lastSync = await indexedDBService.getSetting('lastMessageSync');
    const response = await fetch(`/api/messages/sync?since=${lastSync || 0}`);
    
    if (!response.ok) throw new Error('Erreur synchronisation messages');

    const { messages } = await response.json();
    
    for (const message of messages) {
      await indexedDBService.saveMessage(message);
    }

    await indexedDBService.setSetting('lastMessageSync', Date.now());
  }

  async syncSessions() {
    const lastSync = await indexedDBService.getSetting('lastSessionSync');
    const response = await fetch(`/api/sessions/sync?since=${lastSync || 0}`);
    
    if (!response.ok) throw new Error('Erreur synchronisation sessions');

    const { sessions } = await response.json();
    
    for (const session of sessions) {
      await indexedDBService.saveSession(session);
    }

    await indexedDBService.setSetting('lastSessionSync', Date.now());
  }

  async syncDocuments() {
    const lastSync = await indexedDBService.getSetting('lastDocumentSync');
    const response = await fetch(`/api/documents/sync?since=${lastSync || 0}`);
    
    if (!response.ok) throw new Error('Erreur synchronisation documents');

    const { documents } = await response.json();
    
    for (const document of documents) {
      await indexedDBService.saveDocument(document);
    }

    await indexedDBService.setSetting('lastDocumentSync', Date.now());
  }

  // Méthodes d'aide pour la gestion des listeners
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erreur dans listener sync:', error);
      }
    });
  }

  destroy() {
    this.stopPeriodicSync();
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners.clear();
  }
}

export const syncService = new SyncService();
export default syncService;
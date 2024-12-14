// src/services/sync/SyncService.js
import { dbCache } from '../storage/IndexedDBCache';
import { eventBus, EventTypes } from '../events/EventBus';
import { performanceMonitor } from '../performance/PerformanceMonitor';
import { analytics } from '../analytics/AnalyticsService';

class SyncService {
  constructor() {
    this.syncQueue = new Map();
    this.isSyncing = false;
    this.syncInterval = null;
    this.retryDelays = [1000, 5000, 15000, 30000]; // Délais de retry progressifs
  }

  initialize() {
    // Écouter les événements de connexion
    eventBus.addEventListener(EventTypes.CONNECTION.CONNECTED, () => {
      this.startSync();
    });

    eventBus.addEventListener(EventTypes.CONNECTION.DISCONNECTED, () => {
      this.pauseSync();
    });

    // Démarrer la synchronisation périodique
    this.startPeriodicSync();
  }

  startPeriodicSync(interval = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => this.sync(), interval);
  }

  pauseSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async queueForSync(type, data) {
    const syncId = `${type}_${Date.now()}`;
    this.syncQueue.set(syncId, {
      type,
      data,
      attempts: 0,
      timestamp: Date.now()
    });

    // Tenter une synchronisation immédiate si possible
    if (!this.isSyncing) {
      await this.sync();
    }

    return syncId;
  }

  async sync() {
    if (this.isSyncing || this.syncQueue.size === 0) return;

    this.isSyncing = true;
    const syncStart = performance.now();

    try {
      const entries = Array.from(this.syncQueue.entries());
      for (const [syncId, entry] of entries) {
        try {
          await this.processSyncEntry(syncId, entry);
        } catch (error) {
          this.handleSyncError(syncId, entry, error);
        }
      }
    } finally {
      this.isSyncing = false;
      const syncDuration = performance.now() - syncStart;
      performanceMonitor.trackMetric('sync_duration', syncDuration);
    }
  }

  async processSyncEntry(syncId, entry) {
    const { type, data, attempts } = entry;

    try {
      switch (type) {
        case 'message':
          await this.syncMessage(data);
          break;
        case 'session':
          await this.syncSession(data);
          break;
        default:
          console.warn(`Type de synchronisation inconnu: ${type}`);
      }

      // Succès - supprimer de la queue
      this.syncQueue.delete(syncId);
      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `Synchronisation réussie: ${type}`
      });
    } catch (error) {
      // Gestion des erreurs avec retry
      if (attempts < this.retryDelays.length) {
        const delay = this.retryDelays[attempts];
        this.syncQueue.set(syncId, {
          ...entry,
          attempts: attempts + 1,
          nextRetry: Date.now() + delay
        });
        
        setTimeout(() => this.sync(), delay);
      } else {
        // Échec final après tous les essais
        this.syncQueue.delete(syncId);
        eventBus.emit(EventTypes.SYSTEM.ERROR, {
          message: `Échec de synchronisation après ${attempts} tentatives: ${type}`,
          error: error.message
        });
      }

      throw error;
    }
  }

  async syncMessage(message) {
    // Synchroniser le message avec le serveur
    const response = await fetch(`${config.API.BASE_URL}/api/messages/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Erreur synchronisation message: ${response.statusText}`);
    }

    const result = await response.json();
    await dbCache.saveMessages([result]);
    
    analytics.trackEvent('sync', 'message_synced', {
      messageId: message.id,
      sessionId: message.sessionId
    });
  }

  async syncSession(session) {
    const response = await fetch(`${config.API.BASE_URL}/api/sessions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });

    if (!response.ok) {
      throw new Error(`Erreur synchronisation session: ${response.statusText}`);
    }

    const result = await response.json();
    await dbCache.saveSessions([result]);
    
    analytics.trackEvent('sync', 'session_synced', {
      sessionId: session.session_id
    });
  }

  // Vérifier l'état de synchronisation d'une entrée
  getSyncStatus(syncId) {
    return this.syncQueue.get(syncId);
  }

  // Forcer la resynchronisation d'une entrée
  async forceSyncEntry(syncId) {
    const entry = this.syncQueue.get(syncId);
    if (entry) {
      entry.attempts = 0;
      entry.nextRetry = null;
      await this.sync();
    }
  }
}

export const syncService = new SyncService();
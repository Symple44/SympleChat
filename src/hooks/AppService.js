// src/services/AppService.js
import { indexedDBService } from './storage/IndexedDBService';
import { syncService } from './sync/SyncService';
import { performanceMonitor } from './performance/PerformanceMonitor';
import { queueService } from './queue/QueueService';
import { eventBus, EventTypes } from './events/EventBus';

class AppService {
  constructor() {
    this.initialized = false;
    this.services = {
      db: indexedDBService,
      sync: syncService,
      performance: performanceMonitor,
      queue: queueService
    };
    
    this.state = {
      isOnline: navigator.onLine,
      isInitialized: false,
      isSyncing: false,
      currentUser: null,
      error: null
    };
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initialisation des services...');
      const initStart = performance.now();

      // Démarrer le monitoring des performances
      this.services.performance.start();
      
      // Initialiser la base de données
      await this.services.db.initialize();

      // Initialiser le service de synchronisation
      this.services.sync.initialize();

      // Configuration des écouteurs d'événements
      this.setupEventListeners();

      // Initialisation des files d'attente
      this.setupQueues();

      // Configuration du mode hors-ligne
      this.setupOfflineSupport();

      this.initialized = true;
      this.state.isInitialized = true;

      const initDuration = performance.now() - initStart;
      console.log(`Services initialisés en ${initDuration.toFixed(2)}ms`);

      eventBus.emit(EventTypes.SYSTEM.INITIALIZED, {
        duration: initDuration
      });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      this.state.error = error;
      throw error;
    }
  }

  setupEventListeners() {
    // Gestion de la connectivité
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.handleOffline();
    });

    // Écouter les événements de synchronisation
    eventBus.addEventListener(EventTypes.SYNC.STARTED, () => {
      this.state.isSyncing = true;
    });

    eventBus.addEventListener(EventTypes.SYNC.COMPLETED, () => {
      this.state.isSyncing = false;
    });

    // Gestion des erreurs
    eventBus.addEventListener(EventTypes.SYSTEM.ERROR, this.handleError.bind(this));
  }

  setupQueues() {
    // File d'attente pour les messages
    queueService.createQueue('messages', {
      concurrency: 1,
      retryAttempts: 3,
      timeout: 10000,
      onError: (error, task) => {
        this.handleQueueError('messages', error, task);
      }
    });

    // File d'attente pour la synchronisation
    queueService.createQueue('sync', {
      concurrency: 2,
      retryAttempts: 5,
      timeout: 30000,
      onError: (error, task) => {
        this.handleQueueError('sync', error, task);
      }
    });

    // File d'attente pour les fichiers
    queueService.createQueue('files', {
      concurrency: 3,
      retryAttempts: 3,
      timeout: 60000,
      onError: (error, task) => {
        this.handleQueueError('files', error, task);
      }
    });
  }

  setupOfflineSupport() {
    // Configurer le service worker si disponible
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker enregistré:', registration);
        })
        .catch(error => {
          console.error('Erreur Service Worker:', error);
        });
    }

    // Configurer la synchronisation en arrière-plan
    this.setupBackgroundSync();
  }

  setupBackgroundSync() {
    if ('sync' in navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-messages');
        registration.sync.register('sync-files');
      });
    }
  }

  async handleOnline() {
    console.log('Connexion rétablie');
    eventBus.emit(EventTypes.SYSTEM.ONLINE);

    // Synchroniser les données
    try {
      await this.services.sync.sync();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }

    // Reprendre les queues
    Object.keys(this.services.queue.queues).forEach(queueName => {
      this.services.queue.resumeQueue(queueName);
    });
  }

  handleOffline() {
    console.log('Connexion perdue');
    eventBus.emit(EventTypes.SYSTEM.OFFLINE);

    // Mettre en pause les queues non critiques
    this.services.queue.pauseQueue('sync');
    this.services.queue.pauseQueue('files');
  }

  handleError(error) {
    console.error('Erreur système:', error);
    this.state.error = error;

    // Notifier l'interface utilisateur
    eventBus.emit(EventTypes.UI.SHOW_ERROR, {
      message: error.message,
      type: 'error',
      duration: 5000
    });

    // Tenter une récupération si possible
    this.attemptRecovery(error);
  }

  handleQueueError(queueName, error, task) {
    console.error(`Erreur dans la queue ${queueName}:`, error);
    
    // Stocker la tâche échouée pour réessayer plus tard
    this.services.db.addToOfflineQueue({
      queue: queueName,
      task: task,
      error: error.message,
      timestamp: Date.now()
    });
  }

  async attemptRecovery(error) {
    console.log('Tentative de récupération...');

    try {
      // Réinitialiser les services si nécessaire
      if (!this.services.db.isConnected) {
        await this.services.db.initialize();
      }

      // Récupérer les queues
      await this.services.queue.recover();

      // Forcer une synchronisation
      if (this.state.isOnline) {
        await this.services.sync.sync();
      }

      console.log('Récupération réussie');
      this.state.error = null;

    } catch (recoveryError) {
      console.error('Échec de la récupération:', recoveryError);
      
      // Notifier d'un problème plus sérieux
      eventBus.emit(EventTypes.SYSTEM.CRITICAL_ERROR, {
        originalError: error,
        recoveryError: recoveryError
      });
    }
  }

  // API Publique
  async sendMessage(content, options = {}) {
    return this.services.queue.addTask('messages', async () => {
      const perfMark = this.services.performance.startMeasure('send_message');
      
      try {
        const result = await this.processMessage(content, options);
        this.services.performance.endMeasure(perfMark);
        return result;
      } catch (error) {
        this.services.performance.endMeasure(perfMark);
        throw error;
      }
    }, options.priority);
  }

  async processMessage(content, options) {
    // Traitement local
    const message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...options
    };

    // Sauvegarder localement
    await this.services.db.saveMessage(message);

    // Si en ligne, envoyer au serveur
    if (this.state.isOnline) {
      // Envoyer au serveur...
    } else {
      // Ajouter à la queue de sync
      await this.services.db.addToOfflineQueue({
        type: 'message',
        payload: message
      });
    }

    return message;
  }

  async loadMessages(sessionId, options = {}) {
    const perfMark = this.services.performance.startMeasure('load_messages');
    
    try {
      // Charger depuis le cache local
      const cachedMessages = await this.services.db.getMessages(sessionId);
      
      // Si en ligne, vérifier les mises à jour
      if (this.state.isOnline) {
        this.services.queue.addTask('sync', async () => {
          await this.syncMessages(sessionId);
        }, this.services.queue.priorities.LOW);
      }

      this.services.performance.endMeasure(perfMark);
      return cachedMessages;
    } catch (error) {
      this.services.performance.endMeasure(perfMark);
      throw error;
    }
  }

  async syncMessages(sessionId) {
    // Synchroniser avec le serveur...
  }

  // Méthodes utilitaires
  getStats() {
    return {
      performance: this.services.performance.getPerformanceScore(),
      queues: Object.fromEntries(
        Object.entries(this.services.queue.queues).map(([name, queue]) => [
          name,
          this.services.queue.getQueueStats(name)
        ])
      ),
      sync: {
        lastSync: this.services.sync.lastSyncTime,
        pendingChanges: this.services.sync.pendingChangesCount
      },
      storage: {
        usage: this.services.db.getStorageStats()
      }
    };
  }

  async cleanup() {
    await Promise.all([
      this.services.db.cleanup(),
      this.services.queue.cleanup(),
      this.services.performance.clearMetrics()
    ]);
  }

  destroy() {
    // Nettoyage des services
    Object.values(this.services).forEach(service => {
      if (typeof service.destroy === 'function') {
        service.destroy();
      }
    });

    // Retirer les écouteurs d'événements
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    this.initialized = false;
    this.state.isInitialized = false;
  }
}

export const appService = new AppService();
export default appService;

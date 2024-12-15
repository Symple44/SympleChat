// src/services/search/SearchIndexer.js
import { performanceMonitor } from '../performance/PerformanceMonitor';
import { eventBus, EventTypes } from '../events/EventBus';
import { dbCache } from '../storage/IndexedDBCache';

class SearchIndexer {
  constructor() {
    this.index = null;
    this.worker = null;
    this.indexingPromise = null;
    this.progress = 0;
  }

  async initialize() {
    // Créer un worker pour l'indexation en arrière-plan
    this.worker = new Worker(new URL('./search.worker.js', import.meta.url));
    
    this.worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'progress':
          this.progress = data.progress;
          eventBus.emit(EventTypes.SEARCH.INDEXING_PROGRESS, {
            progress: this.progress
          });
          break;
          
        case 'complete':
          this.index = data.index;
          this.saveIndex();
          eventBus.emit(EventTypes.SEARCH.INDEXING_COMPLETE);
          break;
          
        case 'error':
          console.error('Erreur indexation:', data.error);
          eventBus.emit(EventTypes.SEARCH.INDEXING_ERROR, {
            error: data.error
          });
          break;
      }
    };

    // Charger l'index depuis le cache
    await this.loadIndex();
  }

  async loadIndex() {
    try {
      const cachedIndex = await dbCache.get('searchIndex');
      if (cachedIndex) {
        this.index = cachedIndex;
        console.log('Index chargé depuis le cache');
      }
    } catch (error) {
      console.error('Erreur chargement index:', error);
    }
  }

  async saveIndex() {
    try {
      await dbCache.set('searchIndex', this.index);
      console.log('Index sauvegardé dans le cache');
    } catch (error) {
      console.error('Erreur sauvegarde index:', error);
    }
  }

  async indexMessages(messages) {
    const perfMark = performanceMonitor.startMeasure('index_messages');

    try {
      this.indexingPromise = new Promise((resolve, reject) => {
        this.worker.postMessage({
          type: 'index',
          messages: messages
        });

        const cleanup = () => {
          this.worker.removeEventListener('message', handleMessage);
          this.worker.removeEventListener('error', handleError);
        };

        const handleMessage = (event) => {
          if (event.data.type === 'complete') {
            cleanup();
            resolve(event.data.index);
          }
        };

        const handleError = (error) => {
          cleanup();
          reject(error);
        };

        this.worker.addEventListener('message', handleMessage);
        this.worker.addEventListener('error', handleError);
      });

      const index = await this.indexingPromise;
      this.index = index;
      await this.saveIndex();

      performanceMonitor.endMeasure(perfMark);
      return index;

    } catch (error) {
      performanceMonitor.endMeasure(perfMark);
      throw error;
    }
  }

  async search(query, options = {}) {
    if (!this.index) {
      throw new Error('Index non initialisé');
    }

    const perfMark = performanceMonitor.startMeasure('search_query');

    try {
      return new Promise((resolve, reject) => {
        this.worker.postMessage({
          type: 'search',
          query,
          options,
          index: this.index
        });

        const handleMessage = (event) => {
          if (event.data.type === 'search_results') {
            this.worker.removeEventListener('message', handleMessage);
            resolve(event.data.results);
          }
        };

        this.worker.addEventListener('message', handleMessage);
      });

    } finally {
      performanceMonitor.endMeasure(perfMark);
    }
  }

  getProgress() {
    return this.progress;
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const searchIndexer = new SearchIndexer();
export default searchIndexer;
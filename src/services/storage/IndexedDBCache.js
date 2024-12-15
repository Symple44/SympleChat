// src/services/storage/IndexedDBService.js
class IndexedDBService {
  constructor(dbName = 'chatApp', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.stores = {
      messages: 'messages',
      sessions: 'sessions',
      documents: 'documents',
      settings: 'settings',
      offline: 'offline'
    };
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Erreur d\'initialisation IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB initialisé avec succès');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store Messages
        if (!db.objectStoreNames.contains(this.stores.messages)) {
          const messagesStore = db.createObjectStore(this.stores.messages, {
            keyPath: 'id'
          });
          messagesStore.createIndex('sessionId', 'sessionId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
          messagesStore.createIndex('type', 'type', { unique: false });
        }

        // Store Sessions
        if (!db.objectStoreNames.contains(this.stores.sessions)) {
          const sessionsStore = db.createObjectStore(this.stores.sessions, {
            keyPath: 'session_id'
          });
          sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          sessionsStore.createIndex('status', 'status', { unique: false });
        }

        // Store Documents
        if (!db.objectStoreNames.contains(this.stores.documents)) {
          const documentsStore = db.createObjectStore(this.stores.documents, {
            keyPath: 'id'
          });
          documentsStore.createIndex('messageId', 'messageId', { unique: false });
          documentsStore.createIndex('type', 'type', { unique: false });
        }

        // Store Settings
        if (!db.objectStoreNames.contains(this.stores.settings)) {
          db.createObjectStore(this.stores.settings, { keyPath: 'key' });
        }

        // Store Offline Queue
        if (!db.objectStoreNames.contains(this.stores.offline)) {
          const offlineStore = db.createObjectStore(this.stores.offline, {
            keyPath: 'id',
            autoIncrement: true
          });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          offlineStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async transaction(storeName, mode = 'readonly') {
    if (!this.db) {
      await this.initialize();
    }
    const tx = this.db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(store);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  // Messages
  async saveMessage(message) {
    const store = await this.transaction(this.stores.messages, 'readwrite');
    return store.put(message);
  }

  async getMessages(sessionId, limit = 50, offset = 0) {
    const store = await this.transaction(this.stores.messages);
    const index = store.index('sessionId');
    
    return new Promise((resolve, reject) => {
      const messages = [];
      let skipped = 0;
      
      index.openCursor(IDBKeyRange.only(sessionId), 'prev').onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (!cursor || messages.length >= limit) {
          resolve(messages);
          return;
        }

        if (skipped < offset) {
          skipped++;
          cursor.continue();
          return;
        }

        messages.push(cursor.value);
        cursor.continue();
      };
    });
  }

  // Sessions
  async saveSession(session) {
    const store = await this.transaction(this.stores.sessions, 'readwrite');
    return store.put(session);
  }

  async getSessions() {
    const store = await this.transaction(this.stores.sessions);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Documents
  async saveDocument(document) {
    const store = await this.transaction(this.stores.documents, 'readwrite');
    return store.put(document);
  }

  async getDocuments(messageId) {
    const store = await this.transaction(this.stores.documents);
    const index = store.index('messageId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(messageId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Settings
  async setSetting(key, value) {
    const store = await this.transaction(this.stores.settings, 'readwrite');
    return store.put({ key, value });
  }

  async getSetting(key) {
    const store = await this.transaction(this.stores.settings);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Offline Queue
  async addToOfflineQueue(action) {
    const store = await this.transaction(this.stores.offline, 'readwrite');
    return store.add({
      ...action,
      timestamp: new Date().toISOString()
    });
  }

  async getOfflineQueue() {
    const store = await this.transaction(this.stores.offline);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearOfflineQueue() {
    const store = await this.transaction(this.stores.offline, 'readwrite');
    return store.clear();
  }

  // Maintenance
  async cleanup(daysToKeep = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    for (const storeName of Object.values(this.stores)) {
      const store = await this.transaction(storeName, 'readwrite');
      if (store.index('timestamp')) {
        const range = IDBKeyRange.upperBound(cutoff.toISOString());
        store.index('timestamp').openCursor(range).onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      }
    }
  }

  async clear() {
    for (const storeName of Object.values(this.stores)) {
      const store = await this.transaction(storeName, 'readwrite');
      await store.clear();
    }
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const indexedDBService = new IndexedDBService();
export default indexedDBService;

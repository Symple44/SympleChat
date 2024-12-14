// src/services/storage/IndexedDBCache.js
class IndexedDBCache {
  constructor(dbName = 'chatCache', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.ready = this.initDB();
  }

  async initDB() {
    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Store pour les messages
          if (!db.objectStoreNames.contains('messages')) {
            const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
            messageStore.createIndex('sessionId', 'sessionId', { unique: false });
            messageStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // Store pour les sessions
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionStore = db.createObjectStore('sessions', { keyPath: 'session_id' });
            sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // Store pour les documents
          if (!db.objectStoreNames.contains('documents')) {
            const docStore = db.createObjectStore('documents', { keyPath: 'id' });
            docStore.createIndex('messageId', 'messageId', { unique: false });
          }
        };
      });

      return true;
    } catch (error) {
      console.error('Erreur initialisation IndexedDB:', error);
      return false;
    }
  }

  async transaction(storeName, mode, callback) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      callback(store);
    });
  }

  // Gestion des messages
  async saveMessages(messages) {
    return this.transaction('messages', 'readwrite', (store) => {
      messages.forEach(message => {
        store.put(message);
      });
    });
  }

  async getSessionMessages(sessionId) {
    const messages = [];
    await this.transaction('messages', 'readonly', (store) => {
      const index = store.index('sessionId');
      const request = index.openCursor(IDBKeyRange.only(sessionId));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          messages.push(cursor.value);
          cursor.continue();
        }
      };
    });
    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Gestion des sessions
  async saveSessions(sessions) {
    return this.transaction('sessions', 'readwrite', (store) => {
      sessions.forEach(session => {
        store.put(session);
      });
    });
  }

  async getSessions() {
    const sessions = [];
    await this.transaction('sessions', 'readonly', (store) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          sessions.push(cursor.value);
          cursor.continue();
        }
      };
    });
    return sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Nettoyage périodique
  async cleanup(daysToKeep = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    await Promise.all([
      this.transaction('messages', 'readwrite', (store) => {
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoff.toISOString());
        index.openCursor(range).onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      }),
      this.transaction('sessions', 'readwrite', (store) => {
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoff.toISOString());
        index.openCursor(range).onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      })
    ]);
  }

  // Gestion des erreurs et récupération
  async recover() {
    if (!this.db) {
      await this.initDB();
    }
    await this.cleanup();
  }
}

export const dbCache = new IndexedDBCache();
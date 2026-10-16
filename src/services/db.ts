import type { AppSettings, Conversation, CropDiagnosis } from '../types';

const DB_NAME = 'CropMateOfflineDB';
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: AppSettings = {
  ollamaEndpoint: 'http://127.0.0.1:11434',
  selectedModel: '',
  preferredLanguage: 'en',
  autoSpeakAnswer: false,
  speechRate: 1.0,
  offlineModeOnly: true,
  theme: 'light',
};

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
          convStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('diagnoses')) {
          const diagStore = db.createObjectStore('diagnoses', { keyPath: 'id' });
          diagStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Conversations ---
  async saveConversation(conv: Conversation): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('conversations', 'readwrite');
      const store = tx.objectStore('conversations');
      const req = store.put(conv);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('conversations', 'readonly');
      const store = tx.objectStore('conversations');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllConversations(): Promise<Conversation[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('conversations', 'readonly');
      const store = tx.objectStore('conversations');
      const req = store.getAll();
      req.onsuccess = () => {
        const results: Conversation[] = req.result || [];
        // Sort newest first
        results.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteConversation(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('conversations', 'readwrite');
      const store = tx.objectStore('conversations');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async renameConversation(id: string, newTitle: string): Promise<void> {
    const conv = await this.getConversation(id);
    if (!conv) return;
    conv.title = newTitle.trim();
    conv.updatedAt = Date.now();
    await this.saveConversation(conv);
  }

  // --- Diagnoses ---
  async saveDiagnosis(diag: CropDiagnosis): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('diagnoses', 'readwrite');
      const store = tx.objectStore('diagnoses');
      const req = store.put(diag);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getAllDiagnoses(): Promise<CropDiagnosis[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('diagnoses', 'readonly');
      const store = tx.objectStore('diagnoses');
      const req = store.getAll();
      req.onsuccess = () => {
        const list: CropDiagnosis[] = req.result || [];
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteDiagnosis(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('diagnoses', 'readwrite');
      const store = tx.objectStore('diagnoses');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    const db = await this.openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('app_settings');
      req.onsuccess = () => {
        if (req.result && req.result.value) {
          resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      };
      req.onerror = () => resolve(DEFAULT_SETTINGS);
    });
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key: 'app_settings', value: updated });
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  // --- Bookmarks ---
  async getBookmarks(): Promise<string[]> {
    const db = await this.openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('bookmarks', 'readonly');
      const store = tx.objectStore('bookmarks');
      const req = store.getAll();
      req.onsuccess = () => {
        const ids = (req.result || []).map((item: { id: string }) => item.id);
        resolve(ids);
      };
      req.onerror = () => resolve([]);
    });
  }

  async toggleBookmark(articleId: string): Promise<boolean> {
    const db = await this.openDB();
    const bookmarks = await this.getBookmarks();
    const isBookmarked = bookmarks.includes(articleId);

    return new Promise((resolve, reject) => {
      const tx = db.transaction('bookmarks', 'readwrite');
      const store = tx.objectStore('bookmarks');
      if (isBookmarked) {
        const req = store.delete(articleId);
        req.onsuccess = () => resolve(false);
        req.onerror = () => reject(req.error);
      } else {
        const req = store.put({ id: articleId, addedAt: Date.now() });
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      }
    });
  }

  // --- Export & Import Backup ---
  async exportBackupData(): Promise<string> {
    const conversations = await this.getAllConversations();
    const diagnoses = await this.getAllDiagnoses();
    const settings = await this.getSettings();
    const bookmarks = await this.getBookmarks();

    const backup = {
      app: 'CropMate Offline',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        conversations,
        diagnoses,
        settings,
        bookmarks,
      },
    };

    return JSON.stringify(backup, null, 2);
  }

  async importBackupData(jsonString: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.data) {
        return { success: false, message: 'Invalid backup file structure.', count: 0 };
      }

      const { conversations, diagnoses, settings, bookmarks } = parsed.data;
      let count = 0;

      if (Array.isArray(conversations)) {
        for (const c of conversations) {
          if (c && c.id && c.title && Array.isArray(c.messages)) {
            await this.saveConversation(c);
            count++;
          }
        }
      }

      if (Array.isArray(diagnoses)) {
        for (const d of diagnoses) {
          if (d && d.id && d.cropType) {
            await this.saveDiagnosis(d);
            count++;
          }
        }
      }

      if (settings && typeof settings === 'object') {
        await this.saveSettings(settings);
      }

      if (Array.isArray(bookmarks)) {
        for (const bId of bookmarks) {
          if (typeof bId === 'string') {
            const db = await this.openDB();
            const tx = db.transaction('bookmarks', 'readwrite');
            tx.objectStore('bookmarks').put({ id: bId, addedAt: Date.now() });
          }
        }
      }

      return { success: true, message: `Successfully restored ${count} items.`, count };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err.message || 'Corrupted file'}`, count: 0 };
    }
  }

  async clearAllData(): Promise<void> {
    const db = await this.openDB();
    const stores = ['conversations', 'diagnoses', 'bookmarks'];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach((storeName) => tx.objectStore(storeName).clear());
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbService = new StorageService();

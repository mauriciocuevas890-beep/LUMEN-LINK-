import { CachedProfileEntry } from '../types';

const DB_NAME = 'lumen_profiles_db';
const DB_VERSION = 1;
const STORE_NAME = 'profiles';

/**
 * Opens or initializes the IndexedDB store for long-term profile persistence on iOS / Android.
 * Contains strict timeout safeguard to prevent Safari hanging in Private Mode.
 */
function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let resolved = false;

    // In iOS Safari Private Browsing or restricted WebViews, indexedDB.open() can hang indefinitely.
    // Timeout safeguard ensures the app NEVER stalls.
    const safetyTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 350);

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'cleanUsername' });
          }
        } catch (_) {}
      };

      request.onsuccess = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(safetyTimer);
          resolve(request.result);
        }
      };

      request.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(safetyTimer);
          resolve(null);
        }
      };

      request.onblocked = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(safetyTimer);
          resolve(null);
        }
      };
    } catch (_) {
      if (!resolved) {
        resolved = true;
        clearTimeout(safetyTimer);
        resolve(null);
      }
    }
  });
}

/**
 * Retrieves a cached profile and links from IndexedDB by sanitized username.
 */
export async function getIdbProfile(cleanUsername: string): Promise<CachedProfileEntry | null> {
  if (!cleanUsername) return null;

  try {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(cleanUsername.toLowerCase().trim());

        request.onsuccess = () => {
          const result = request.result;
          if (result && result.entry && result.entry.profile) {
            resolve(result.entry as CachedProfileEntry);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          resolve(null);
        };
      } catch (txErr) {
        console.warn('IndexedDB read transaction error:', txErr);
        resolve(null);
      }
    });
  } catch (err) {
    console.warn('Error reading profile from IndexedDB:', err);
    return null;
  }
}

/**
 * Stores a profile and its links into IndexedDB for persistent offline/instant access.
 */
export async function setIdbProfile(cleanUsername: string, entry: CachedProfileEntry): Promise<void> {
  if (!cleanUsername || !entry?.profile) return;

  try {
    const db = await openDatabase();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const record = {
          cleanUsername: cleanUsername.toLowerCase().trim(),
          entry,
          updatedAt: Date.now(),
        };

        const request = store.put(record);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (err) => {
          console.warn('IndexedDB put error:', err);
          resolve();
        };
      } catch (txErr) {
        console.warn('IndexedDB write transaction error:', txErr);
        resolve();
      }
    });
  } catch (err) {
    console.warn('Error saving profile to IndexedDB:', err);
  }
}

/**
 * Removes a profile from IndexedDB cache.
 */
export async function removeIdbProfile(cleanUsername: string): Promise<void> {
  if (!cleanUsername) return;

  try {
    const db = await openDatabase();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(cleanUsername.toLowerCase().trim());

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Ignore cleanup error
  }
}

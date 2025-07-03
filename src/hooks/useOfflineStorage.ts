
import { useState, useEffect } from 'react';

interface OfflineData {
  studios: any[];
  bookings: any[];
  favorites: any[];
  profile: any;
  lastSync: number;
}

export const useOfflineStorage = () => {
  const [offlineData, setOfflineData] = useState<OfflineData>({
    studios: [],
    bookings: [],
    favorites: [],
    profile: null,
    lastSync: 0
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Initialize IndexedDB and load cached data
    initializeDB();
    loadCachedData();

    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeDB = async () => {
    try {
      const db = await openIndexedDB();
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  };

  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BookMyStudioDB', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('studios')) {
          db.createObjectStore('studios', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('bookings')) {
          db.createObjectStore('bookings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offlineActions')) {
          db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  const loadCachedData = async () => {
    try {
      const db = await openIndexedDB();
      
      const [studios, bookings, favorites, profile] = await Promise.all([
        getAllFromStore(db, 'studios'),
        getAllFromStore(db, 'bookings'),
        getAllFromStore(db, 'favorites'),
        getAllFromStore(db, 'profile')
      ]);

      setOfflineData({
        studios: studios || [],
        bookings: bookings || [],
        favorites: favorites || [],
        profile: profile?.[0] || null,
        lastSync: Date.now()
      });
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  };

  const getAllFromStore = (db: IDBDatabase, storeName: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const cacheData = async (storeName: string, data: any[]) => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Clear existing data
      await store.clear();
      
      // Add new data
      for (const item of data) {
        await store.add(item);
      }
      
      console.log(`Cached ${data.length} items in ${storeName}`);
    } catch (error) {
      console.error(`Failed to cache data in ${storeName}:`, error);
    }
  };

  const addOfflineAction = async (action: any) => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      await store.add({
        ...action,
        timestamp: Date.now(),
        synced: false
      });
      
      console.log('Offline action queued:', action.type);
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;
    
    try {
      console.log('Syncing offline data...');
      
      // Register background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-bookings');
        await registration.sync.register('sync-favorites');
      }
      
      // Update last sync time
      setOfflineData(prev => ({ ...prev, lastSync: Date.now() }));
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  return {
    offlineData,
    isOnline,
    cacheData,
    addOfflineAction,
    syncOfflineData,
    loadCachedData
  };
};

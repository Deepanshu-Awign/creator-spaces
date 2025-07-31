
const CACHE_NAME = 'creator-spaces-v1';
const OFFLINE_URL = '/offline.html';

// Critical resources to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/lovable-uploads/63c25b0c-9e71-4bbb-b0e3-4529c6c44ecf.png'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/studios/,
  /\/profile/,
  /\/favorites/,
  /\/bookings/
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(request)
          .then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(request))
      })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncOfflineBookings());
  }
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncOfflineFavorites());
  }
});

async function syncOfflineBookings() {
  try {
    const db = await openDB();
    const offlineBookings = await getOfflineBookings(db);
    
    for (const booking of offlineBookings) {
      try {
        // Attempt to sync booking to server
        const response = await fetch('/api/bookings', {
          method: 'POST',
          body: JSON.stringify(booking.data),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          await removeOfflineBooking(db, booking.id);
        }
      } catch (error) {
        console.log('Failed to sync booking:', booking.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncOfflineFavorites() {
  // Similar implementation for favorites sync
  console.log('Syncing offline favorites...');
}

// IndexedDB helper functions
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CreatorSpacesDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offlineBookings')) {
        db.createObjectStore('offlineBookings', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getOfflineBookings(db) {
  const transaction = db.transaction(['offlineBookings'], 'readonly');
  const store = transaction.objectStore('offlineBookings');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeOfflineBooking(db, id) {
  const transaction = db.transaction(['offlineBookings'], 'readwrite');
  const store = transaction.objectStore('offlineBookings');
  return store.delete(id);
}

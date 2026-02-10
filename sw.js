// Service Worker لمتجر جود العباس
const CACHE_NAME = 'jood-alabbas-store-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://raw.githubusercontent.com/sa89588/clothing-search/refs/heads/main/kids-clothing-store.png'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// التنشيط
self.addEventListener('activate', event => {
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
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // إذا فشل جلب المورد، يمكن إرجاع صفحة بديلة
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return null;
          });
      })
  );
});

// إشعارات push
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'عرض جديد في متجر جود العباس!',
    icon: 'https://raw.githubusercontent.com/sa89588/clothing-search/refs/heads/main/kids-clothing-store.png',
    badge: 'https://raw.githubusercontent.com/sa89588/clothing-search/refs/heads/main/kids-clothing-store.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'استكشف المنتجات',
        icon: 'https://raw.githubusercontent.com/sa89588/clothing-search/refs/heads/main/kids-clothing-store.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: 'https://raw.githubusercontent.com/sa89588/clothing-search/refs/heads/main/kids-clothing-store.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('متجر جود العباس', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
// اسم الكاش (Cache Name). تم تغيير الاسم ليعكس التخصيص.
const CACHE_NAME = 'ALssouRy-Station-v1.0.4'; 

// قائمة بالملفات التي يجب تخزينها مؤقتاً
const urlsToCache = [
  './index.html',
  './bundle.js',
  './cache.html',
  './sw.js', 
  './payload.bin', // مهم: تأكد من وجود هذا الملف في المجلد
  './psfree_lapse.png',
  './alssoury_1ogo.jpg' // يُفترض أن هذا هو اسم صورة الخلفية
];

// حدث التثبيت (Install Event): تخزين الملفات مؤقتاً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All assets cached successfully.');
        self.skipWaiting(); 
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache assets.', error);
      })
  );
});

// حدث التفعيل (Activate Event): حذف الإصدارات القديمة من الكاش
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          // هذا الشرط يضمن حذف أي كاش قديم يبدأ بـ 'psfree-lapse-' أو 'ALssouRy-Station-' ولا يطابق اسم الكاش الحالي
          return (cacheName.startsWith('psfree-lapse-') || cacheName.startsWith('ALssouRy-Station-')) && cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Old caches cleared and activated.');
      return self.clients.claim();
    })
  );
});

// حدث الجلب (Fetch Event): خدمة الملفات من الكاش أولاً
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا كان الملف موجوداً في الكاش، قم بإرجاعه
        if (response) {
          return response;
        }
        // إذا لم يكن موجوداً، قم بجلب الملف من الشبكة
        return fetch(event.request);
      })
  );
});
// =========================================================================
// 1. تحديث اسم الكاش (إجباري بعد كل تعديل مهم)
const CACHE_NAME = 'alssoury-station-cache-v14'; 
// =========================================================================

const urlsToCache = [
  '/',
  '/index.html', // أو '/900.html' إذا كنت تستخدمه كملف رئيسي
  // '/cache.html', // يمكن إبقاؤه أو إزالته
  // تم إزالة ملف '/btn.css' من القائمة
  '/alssoury_1ogo.jpg',
  // '/alssoury_logo.png', // أبقِها إذا كانت مستخدمة
  '/fonts/LiberationMono-Regular.ttf', // أبقِها إذا كانت مستخدمة
  '/payload.js',
  './alert.mjs',
  '/bundle.js', // ملف الاستغلال الرئيسي
  '/bundle_reference.js', // الملف الثانوي الملحق
  
  // ملفات البايلود الثابتة
  '/payload.bin', 
  '/pl_goldhen23.bin',
  '/pl_goldhenlite.bin',
  '/pl_goldhenbeta.bin',
  '/pl_ftp.bin',
  '/pl_ps4debug.bin',
  '/pl_appdumper.bin',
  '/pl_app2usb.bin',
  '/pl_OrbisToolbox.bin',
  '/pl_disableupdates.bin',
  '/pl_kerneldumper.bin',
  '/pl_LinuxLoader.js',
  '/pl_LinuxLoader3gb.js',
];

// حدث 'install': يتم تفعيله عند تثبيت Service Worker لأول مرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache); // تخزين جميع الملفات المحددة مؤقتًا
      })
      .then(() => self.skipWaiting()) // لتنشيط Service Worker الجديد فورًا
  );
});

// حدث 'fetch': يتم تفعيله عند كل طلب شبكة من الصفحة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// حدث 'activate': يتم تفعيله عند تنشيط Service Worker جديد
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName); // حذف أي كاش قديم
          }
        })
      );
    }).then(() => self.clients.claim()) // لتفعيل Service Worker الجديد فورًا
  );
});

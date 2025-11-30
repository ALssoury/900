// =========================================================================
// 1. تحديث اسم الكاش (إجباري بعد كل تعديل مهم)
// ** تم تحديث الإصدار إلى v23 لفرض إعادة التخزين المؤقت **
const CACHE_NAME = 'alssoury-station-cache-v24'; 
// =========================================================================

const urlsToCache = [
  '/',
  'index.html', // ملف التوجيه الجديد
  'cache.html', // ملف تثبيت الكاش
  '/900.html', // <--- ملف الاستغلال الرئيسي (AIO)
  // تم إزالة '/index.html' القديم الذي كان يحتوي على محتوى الاستغلال
  '/alssoury_1ogo.jpg',
  '/fonts/LiberationMono-Regular.ttf', 
  '/payload.js',
  './alert.mjs',
  '/bundle.js', 
  '/bundle_reference.js', 
  
  // ملفات البايلود الثابتة
  '/payload.bin', 
  '/aio_patches.bin', // بايلود AIO Fix الضروري
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
    }).then(() => self.clients.claim()) // للتحكم الفوري في صفحات العميل
  );
});
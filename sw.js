// =========================================================================
// 1. تحديث اسم الكاش (إجباري بعد كل تعديل مهم)
// تأكد من أن هذا يتطابق مع CACHE_VERSION في cache.html
const CACHE_NAME = 'alssoury-station-cache-v23'; 
// =========================================================================

// قائمة بجميع الملفات التي يجب تخزينها مؤقتًا للعمل دون اتصال بالإنترنت
const urlsToCache = [
  '/', // المسار الجذر
  '/index.html', // ملف القائمة الرئيسية
  '/cache.html', // ملف تثبيت الكاش
  '/900.html', // ملف تحميل الاستغلال الأساسي
  
  // ملفات الموارد (CSS/JS/صور/خطوط)
  '/alssoury_1ogo.jpg',
  '/fonts/LiberationMono-Regular.ttf', 
  '/payload.js',
  '/alert.mjs',
  '/bundle.js', 
  '/bundle_reference.js', 
  
  // ملفات البايلود الثابتة (BIN/JS)
  '/payload.bin', // البايلود الرئيسي (GoldHEN)
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
  console.log('[Service Worker] Install Event: Caching static assets...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache, adding all URLs.');
        // تخزين جميع الملفات المحددة مؤقتًا
        return cache.addAll(urlsToCache); 
      })
      // تفعيل Service Worker الجديد فورًا لتجنب انتظار إغلاق الصفحات القديمة
      .then(() => self.skipWaiting()) 
      .catch((error) => {
        console.error('[Service Worker] Failed to cache all assets:', error);
      })
  );
});

// حدث 'fetch': يتم تفعيله عند كل طلب شبكة من الصفحة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا كان الملف موجوداً في الكاش، قم بإرجاعه
        if (response) {
          return response;
        }
        
        // إذا لم يكن موجوداً، حاول جلبه من الشبكة
        return fetch(event.request)
          .then((response) => {
            // تحقق من أن الاستجابة صالحة (النوع أساسي و الحالة 200)
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // استنساخ الاستجابة لوضع نسخة في الكاش وإرجاع الأخرى للمتصفح
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // تخزين الطلب في الكاش إذا كان GET (افتراضياً)
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });
            return response;
          })
          .catch((error) => {
              console.warn('[Service Worker] Fetch failed, file not in cache:', event.request.url, error);
              // استجابة احتياطية لخطأ الشبكة
              return new Response("Network error and not found in cache.");
          });
      })
  );
});

// حدث 'activate': يتم تفعيله عند تنشيط Service Worker جديد
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event: Cleaning old caches...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف أي كاش قديم لا يتطابق مع CACHE_NAME الحالي
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName); 
          }
        })
      );
    })
    // تأكد من أن Service Worker يتولى التحكم في الصفحات المفتوحة فوراً
    .then(() => self.clients.claim()) 
  );
});
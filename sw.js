// =========================================================================
// 1. تحديث اسم الكاش (إجباري بعد كل تعديل مهم)
// يتم تغيير الرقم لتحديث جميع ملفات الكاش المخزنة في الجهاز
const CACHE_NAME = 'alssoury-station-cache-v22'; // الإصدار الحالي: 22
// =========================================================================

// قائمة الملفات التي يجب تخزينها مؤقتاً لضمان العمل دون اتصال بالإنترنت
const urlsToCache = [
  '/',
  'index.html', // ملف التوجيه (الرئيسي)
  'cache.html', // ملف تثبيت الكاش
  '/900.html', // <--- صفحة الاستغلال والمنيو الرئيسية
  '/alssoury_1ogo.jpg', // صورة الشعار أو الخلفية
  '/fonts/LiberationMono-Regular.ttf', // الخطوط
  '/payload.js', // ملفات مساعدة للبايلود
  './alert.mjs',
  '/bundle.js', // ملف الاستغلال المدمج
  '/bundle_reference.js', 
  
  // ملفات البايلود الثابتة (.bin)
  '/payload.bin', // البايلود الأساسي (GoldHEN الرئيسي)
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

// -------------------------------------------------------------------------
// 2. حدث 'install': لتخزين الملفات
// -------------------------------------------------------------------------
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

// -------------------------------------------------------------------------
// 3. حدث 'fetch': اعتراض طلبات الشبكة للتحميل من الكاش أولاً
// -------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجد الملف في الكاش، قم بإرجاعه مباشرةً
        if (response) {
          return response;
        }
        
        // إذا لم يوجد، قم بطلب الملف من الشبكة (ويتم تخزينه مؤقتاً إذا كان طلباً ناجحاً)
        return fetch(event.request)
          .then((response) => {
            // تحقق من أن الاستجابة صالحة (status 200)
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // استنساخ الاستجابة لتخزين نسخة في الكاش
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // تخزين الطلب الناجح الجديد في الكاش
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// -------------------------------------------------------------------------
// 4. حدث 'activate': لحذف الكاشات القديمة
// -------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف أي كاش قديم لا يتطابق مع CACHE_NAME الحالي
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName); // حذف أي كاش قديم
          }
        })
      );
    })
  );
});
// =========================================================================
// 1. تحديث اسم الكاش (إجباري بعد كل تعديل مهم)
const CACHE_NAME = 'alssoury-station-cache-v22'; // تم تحديث الإصدار إلى v22
// =========================================================================

const urlsToCache = [
  '/',
  'index.html', // ملف التوجيه الجديد
  'cache.html', // ملف تثبيت الكاش
  '/900.html', // <--- ملف الاستغلال الرئيسي (AIO)
  // تم إزالة '/index.html' القديم الذي كان يحتوي على محتوى الاستغلال
  '/alssoury_logo.jpg', // يمكن استخدام أي صورة شعار هنا
  '/fonts/LiberationMono-Regular.ttf', 
  '/payload.js', // يجب التأكد من وجوده لعملية حقن البايلود
  // './alert.mjs', // لا نحتاجه إذا كنا نستخدم وظيفة تسجيل مدمجة
  '/bundle.js', // ملف منطق الاستغلال (GoldHEN AIO)
  // '/bundle_reference.js', // (للاحتياط، قد لا يكون مطلوباً)
  
  // =======================================================
  // ملفات البايلود الثابتة (يجب تخزينها مؤقتاً لضمان العمل OffLine)
  // =======================================================
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

// حدث 'install': يتم تفعيله أول مرة عند تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache, adding files...');
        // استخدام .addAll() لتخزين جميع الملفات المحددة مؤقتًا
        // في حال فشل تحميل أي ملف، تفشل عملية التخزين بالكامل
        return cache.addAll(urlsToCache); 
      })
      .then(() => {
        console.log('[Service Worker] All files cached successfully.');
        // لتنشيط Service Worker الجديد فورًا بعد التثبيت
        return self.skipWaiting(); 
      })
      .catch((error) => {
        console.error('[Service Worker] Caching failed:', error);
      })
  );
});

// حدث 'fetch': يتم تفعيله عند كل طلب شبكة من الصفحة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجدنا استجابة في الكاش، نرجعها فوراً
        if (response) {
          // console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
          return response;
        }
        
        // إذا لم نجدها في الكاش، نذهب للشبكة
        // console.log(`[Service Worker] Serving from network: ${event.request.url}`);
        return fetch(event.request)
          .then((response) => {
            // تحقق من الاستجابة قبل تخزينها مؤقتاً
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // استنساخ الاستجابة، لأنها قد تُقرأ مرة واحدة فقط
            const responseToCache = response.clone();
            
            // تخزين الاستجابة الجديدة في الكاش للاستخدام المستقبلي
            caches.open(CACHE_NAME)
              .then((cache) => {
                // تجنب تخزين الطلبات غير الضرورية مثل Google Analytics وغيرها
                if (event.request.url.startsWith('http')) {
                   cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          });
      })
  );
});

// حدث 'activate': يتم تفعيله عند تنشيط Service Worker جديد
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف جميع الكاشات القديمة التي ليست في القائمة البيضاء
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // المطالبة بالسيطرة على العملاء (الصفحات) بشكل فوري
        return self.clients.claim();
    })
  );
});=
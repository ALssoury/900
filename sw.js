// =========================================================================
// 1. تحديث اسم الكاش (إجباري بعد كل تعديل مهم)
const CACHE_NAME = 'alssoury-station-cache-v23'; // تم تحديث الإصدار إلى v23
// =========================================================================

const urlsToCache = [
  '/',
  // ملفات الـ HTML والأساسيات
  'index.html', // ملف التوجيه الرئيسي
  '/900.html', // ملف الاستغلال الرئيسي (AIO)
  '/alssoury_logo.jpg', 
  '/fonts/LiberationMono-Regular.ttf', 
  
  // ملفات السكريبت الأساسية
  '/payload.js', 
  '/bundle.js', 
  
  // =======================================================
  // ملفات البايلود الثابتة والجديدة (يجب تخزينها مؤقتاً لضمان العمل OffLine)
  // =======================================================
  '/payload.bin', 
  '/aio_patches.bin', 
  
  // GoldHEN والأدوات الأساسية
  '/pl_goldhen23.bin',
  '/pl_goldhenlite.bin',
  '/pl_ftp.bin',
  '/pl_ps4debug.bin',
  '/pl_appdumper.bin',
  '/pl_app2usb.bin',
  '/pl_OrbisToolbox.bin',
  '/pl_disableupdates.bin',
  '/pl_kerneldumper.bin',
  
  // Linux Loaders
  '/pl_LinuxLoader.js',
  '/pl_LinuxLoader3gb.js',

  // 🔴🔴 المميزات الجديدة (يجب التأكد من وجود هذه الملفات الفارغة/الحقيقية) 🔴🔴
  '/gta_trainer_v1.bin',
  '/rdr2_mod_menu.bin',
  '/ps4_cheat_engine.bin',
  '/ps4_remover.bin',
];

// 2. حدث 'install': يتم تنشيطه عند تنصيب Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// 3. حدث 'fetch': اعتراض جميع طلبات الشبكة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا كان الملف موجوداً في الكاش، قم بإرجاعه فوراً (وضع OffLine)
        if (response) {
          return response;
        }
        
        // إذا لم يكن موجوداً، اذهب للشبكة (Network)
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
                // تجنب تخزين الطلبات غير الضرورية
                if (event.request.url.startsWith('http')) {
                   cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          });
      })
  );
});

// 4. حدث 'activate': حذف الكاشات القديمة
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف جميع الكاشات القديمة
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
});
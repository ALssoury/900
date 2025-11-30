// =========================================================================
// ملف payload.js
// يحتوي على الدوال الأساسية لتحميل البايلود وعرض القائمة
// =========================================================================

/**
 * وظيفة لتحميل البايلود الثنائي (Binary Payload) من ملف.
 * في الاستغلال الفعلي، تقوم هذه الدالة بقراءة ملف .bin وإرساله إلى دالة الحقن (ROPc_jb_inject).
 *
 * @param {string} fileName اسم ملف البايلود (مثلاً: "payload.bin").
 * @param {number} mode وضع الحقن (0 للحزم/الروتينات، 1 للبايلود الرئيسي).
 * @returns {Promise<number>} يعد بـ 1 عند النجاح أو 0 عند الفشل.
 */
async function PayloadLoader(fileName, mode) {
    try {
        // 1. محاكاة قراءة الملف الثنائي باستخدام XMLHttpRequest
        window.log(`[PAYLOAD] Fetching ${fileName}...`);
        const response = await fetch(fileName);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}: HTTP status ${response.status}`);
        }

        // 2. الحصول على المحتوى كـ ArrayBuffer
        const buffer = await response.arrayBuffer();
        window.log(`[PAYLOAD] Loaded ${fileName}, size: ${buffer.byteLength} bytes.`);

        // 3. استدعاء دالة حقن البايلود (المعرفة في ملف Exploit Logic)
        // في حالتك، يتم تعريفها عالميًا كـ window.ROPc_jb_inject
        if (typeof window.ROPc_jb_inject !== 'function') {
            throw new Error("ROPc_jb_inject function is not defined.");
        }

        window.log(`[PAYLOAD] Injecting ${fileName} into memory...`);
        const injectSuccess = await window.ROPc_jb_inject(buffer, mode);

        if (injectSuccess) {
            window.log(`[PAYLOAD] ${fileName} injected successfully.`);
            return 1; // نجاح
        } else {
            window.log(`[PAYLOAD ERROR] Failed to inject ${fileName}.`);
            return 0; // فشل
        }
    } catch (error) {
        window.log(`[PAYLOAD CRITICAL ERROR] Error during PayloadLoader for ${fileName}: ${error.message}`);
        return 0; // فشل
    }
}

/**
 * وظيفة jbdone()
 * يتم استدعاؤها بواسطة دالة doJBwithPSFreeLapseExploit() بعد نجاح حقن GoldHEN.
 * تقوم هذه الدالة بإخفاء شريط التحميل وإظهار قائمة البايلود (الموجودة في 900.html/index.html).
 */
function jbdone() {
    window.log("[INFO] Exploit & Payload Injection Complete.");

    const loadingContainer = document.getElementById("loadingContainer");
    const menuContainer = document.getElementById("mymenu");

    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }

    if (menuContainer) {
        // عرض القائمة إذا كانت موجودة في الصفحة
        menuContainer.style.display = 'block';
        window.log("===================================");
        window.log("GoldHEN Menu is now displayed.");
        window.log("===================================");
    } else {
         window.log("[WARNING] Payload menu element (id='mymenu') not found in the DOM.");
    }
}


// جعل الدوال متاحة عالميًا لاستخدامها في ملفات أخرى
window.PayloadLoader = PayloadLoader;
window.jbdone = jbdone;

console.log("payload.js loaded successfully.");
const translations = {
    en: {
        "common.language": "हिंदी",
        "common.logout": "Logout",
        "common.home": "Home",
        "brand.tagline": "AI-powered campus cleanliness",

        "login.eyebrow": "Smart campus reporting",
        "login.heading": "Keep your campus cleaner, one report at a time.",
        "login.copy": "TrashDetectX combines computer vision, location data and cloud reporting into one simple workflow.",
        "login.point1": "AI verifies whether the uploaded image contains trash.",
        "login.point2": "Reports are stored securely in Firebase.",
        "login.point3": "Admins can track and resolve reports from one dashboard.",
        "login.title": "Welcome back",
        "login.subtitle": "Sign in to continue to TrashDetectX.",
        "login.email": "Email",
        "login.emailPlaceholder": "you@example.com",
        "login.password": "Password",
        "login.passwordPlaceholder": "Enter your password",
        "login.login": "Login",
        "login.signup": "Sign Up",
        "login.or": "or",
        "login.google": "Continue with Google",
        "login.demo": "Use your college account or Google account to get started.",

        "home.eyebrow": "AI + Cloud + Computer Vision",
        "home.heading": "Make waste reporting feel as simple as taking a photo.",
        "home.copy": "TrashDetectX verifies waste with YOLOv8, captures report details and location when available, and gives administrators one place to monitor cleanup.",
        "home.report": "Report Trash",
        "home.account": "Your account",
        "home.loggedIn": "Logged in as",
        "home.workflow": "How TrashDetectX works",
        "home.step1Title": "Capture",
        "home.step1Text": "Upload a clear photo and select where the issue was found.",
        "home.step2Title": "Verify",
        "home.step2Text": "YOLOv8 analyzes the image and identifies detected waste classes.",
        "home.step3Title": "Resolve",
        "home.step3Text": "The admin dashboard tracks the report until it is resolved.",
        "home.secureTitle": "Cloud-backed reporting",
        "home.secureText": "Firebase Firestore keeps report data available to the dashboard.",
        "home.smartTitle": "AI-assisted verification",
        "home.smartText": "The trained YOLOv8 model helps reduce false trash reports.",
        "home.campusTitle": "Built for your campus",
        "home.campusText": "Block, floor and area selection makes indoor reporting practical.",

        "report.eyebrow": "Submit a verified report",
        "report.heading": "Report a waste issue",
        "report.copy": "Tell us where you found the waste, add a photo, and let TrashDetectX verify it.",
        "report.step1": "Choose the exact block, floor and area.",
        "report.step2": "Upload a clear image for AI verification.",
        "report.step3": "The report is sent to the admin dashboard after detection.",
        "report.location": "Location",
        "report.block": "Block",
        "report.blockPlaceholder": "Select a block",
        "report.floor": "Floor",
        "report.floorPlaceholder": "Select a floor",
        "report.area": "Area",
        "report.areaPlaceholder": "Select an area",
        "report.details": "Additional details",
        "report.detailsPlaceholder": "Example: near the entrance or beside the dustbin",
        "report.photo": "Evidence photo",
        "report.photoHint": "Drag & drop an image here or click to browse",
        "report.photoSub": "JPEG, PNG or WebP",
        "report.submit": "Analyze & Submit Report",
        "report.analyzing": "Analyzing image and submitting report...",
        "report.submitted": "Report submitted successfully.",
        "report.noTrash": "No trash was detected in this image. Please upload a clearer image.",
        "report.error": "Something went wrong. Please try again.",
        "report.locationAvailable": "GPS location found in image.",
        "report.locationMissing": "No GPS data found. The report can still be submitted.",
        "report.imageSelected": "Image selected",

        "admin.eyebrow": "Operations center",
        "admin.heading": "Admin control center",
        "admin.copy": "Monitor incoming reports, inspect detected waste and keep cleanup status up to date.",
        "admin.total": "Total reports",
        "admin.pending": "Pending",
        "admin.resolved": "Resolved",
        "admin.search": "Search block, area or details...",
        "admin.allStatus": "All statuses",
        "admin.pendingStatus": "Pending",
        "admin.resolvedStatus": "Resolved",
        "admin.allClasses": "All classes",
        "admin.block": "Block",
        "admin.floor": "Floor",
        "admin.area": "Area",
        "admin.details": "Details",
        "admin.status": "Status",
        "admin.media": "Image & location",
        "admin.classes": "Detected classes",
        "admin.actions": "Actions",
        "admin.viewImage": "View",
        "admin.location": "Location",
        "admin.resolve": "Resolve",
        "admin.delete": "Delete",
        "admin.none": "None",
        "admin.noLocation": "No location",
        "admin.loading": "Loading reports...",
        "admin.empty": "No reports match your filters.",
        "admin.imageTitle": "Detected trash image",
        "admin.deleteConfirm": "Delete this report?",
        "admin.failed": "Unable to load reports."
    },
    hi: {
        "common.language": "English",
        "common.logout": "लॉग आउट",
        "common.home": "होम",
        "brand.tagline": "AI आधारित कैंपस स्वच्छता",

        "login.eyebrow": "स्मार्ट कैंपस रिपोर्टिंग",
        "login.heading": "एक-एक रिपोर्ट से अपने कैंपस को साफ रखें।",
        "login.copy": "TrashDetectX कंप्यूटर विज़न, लोकेशन डेटा और क्लाउड रिपोर्टिंग को एक सरल सिस्टम में जोड़ता है।",
        "login.point1": "AI जांचता है कि अपलोड की गई तस्वीर में कचरा है या नहीं।",
        "login.point2": "रिपोर्ट Firebase में सुरक्षित रूप से स्टोर होती हैं।",
        "login.point3": "एडमिन एक डैशबोर्ड से रिपोर्ट देख और हल कर सकता है।",
        "login.title": "वापसी पर स्वागत है",
        "login.subtitle": "TrashDetectX जारी रखने के लिए साइन इन करें।",
        "login.email": "ईमेल",
        "login.emailPlaceholder": "you@example.com",
        "login.password": "पासवर्ड",
        "login.passwordPlaceholder": "अपना पासवर्ड दर्ज करें",
        "login.login": "लॉग इन",
        "login.signup": "साइन अप",
        "login.or": "या",
        "login.google": "Google से जारी रखें",
        "login.demo": "शुरू करने के लिए कॉलेज या Google अकाउंट का उपयोग करें।",

        "home.eyebrow": "AI + Cloud + Computer Vision",
        "home.heading": "कचरा रिपोर्ट करना फोटो लेने जितना आसान बनाएं।",
        "home.copy": "TrashDetectX YOLOv8 से कचरे की जांच करता है, उपलब्ध होने पर लोकेशन और रिपोर्ट विवरण लेता है और एडमिन को एक ही जगह पर निगरानी देता है।",
        "home.report": "कचरा रिपोर्ट करें",
        "home.account": "आपका अकाउंट",
        "home.loggedIn": "लॉग इन:",
        "home.workflow": "TrashDetectX कैसे काम करता है",
        "home.step1Title": "फोटो लें",
        "home.step1Text": "एक साफ तस्वीर अपलोड करें और जगह चुनें।",
        "home.step2Title": "जांच",
        "home.step2Text": "YOLOv8 तस्वीर का विश्लेषण करके कचरे की क्लास पहचानता है।",
        "home.step3Title": "समाधान",
        "home.step3Text": "एडमिन डैशबोर्ड रिपोर्ट को समाधान तक ट्रैक करता है।",
        "home.secureTitle": "क्लाउड आधारित रिपोर्टिंग",
        "home.secureText": "Firebase Firestore रिपोर्ट डेटा को डैशबोर्ड के लिए उपलब्ध रखता है।",
        "home.smartTitle": "AI आधारित जांच",
        "home.smartText": "ट्रेंड YOLOv8 मॉडल गलत कचरा रिपोर्ट को कम करने में मदद करता है।",
        "home.campusTitle": "आपके कैंपस के लिए",
        "home.campusText": "ब्लॉक, फ्लोर और एरिया चयन इनडोर रिपोर्टिंग को आसान बनाता है।",

        "report.eyebrow": "सत्यापित रिपोर्ट भेजें",
        "report.heading": "कचरे की रिपोर्ट करें",
        "report.copy": "कहां कचरा मिला बताएं, फोटो जोड़ें और TrashDetectX से इसकी जांच करवाएं।",
        "report.step1": "सही ब्लॉक, फ्लोर और एरिया चुनें।",
        "report.step2": "AI जांच के लिए साफ तस्वीर अपलोड करें।",
        "report.step3": "कचरा मिलने पर रिपोर्ट एडमिन डैशबोर्ड पर भेजी जाएगी।",
        "report.location": "स्थान",
        "report.block": "ब्लॉक",
        "report.blockPlaceholder": "ब्लॉक चुनें",
        "report.floor": "फ्लोर",
        "report.floorPlaceholder": "फ्लोर चुनें",
        "report.area": "एरिया",
        "report.areaPlaceholder": "एरिया चुनें",
        "report.details": "अतिरिक्त जानकारी",
        "report.detailsPlaceholder": "उदाहरण: प्रवेश द्वार के पास या डस्टबिन के बगल में",
        "report.photo": "फोटो",
        "report.photoHint": "तस्वीर यहां खींचें या क्लिक करके चुनें",
        "report.photoSub": "JPEG, PNG या WebP",
        "report.submit": "जांच करके रिपोर्ट भेजें",
        "report.analyzing": "तस्वीर की जांच और रिपोर्ट सबमिट की जा रही है...",
        "report.submitted": "रिपोर्ट सफलतापूर्वक भेज दी गई।",
        "report.noTrash": "इस तस्वीर में कचरा नहीं मिला। कृपया साफ तस्वीर अपलोड करें।",
        "report.error": "कुछ गलत हुआ। कृपया फिर प्रयास करें।",
        "report.locationAvailable": "तस्वीर में GPS लोकेशन मिली।",
        "report.locationMissing": "GPS डेटा नहीं मिला। रिपोर्ट फिर भी भेजी जा सकती है।",
        "report.imageSelected": "तस्वीर चुनी गई",

        "admin.eyebrow": "ऑपरेशंस सेंटर",
        "admin.heading": "एडमिन कंट्रोल सेंटर",
        "admin.copy": "नई रिपोर्ट देखें, डिटेक्ट हुए कचरे की जांच करें और सफाई की स्थिति अपडेट रखें।",
        "admin.total": "कुल रिपोर्ट",
        "admin.pending": "लंबित",
        "admin.resolved": "सुलझी",
        "admin.search": "ब्लॉक, एरिया या विवरण खोजें...",
        "admin.allStatus": "सभी स्थिति",
        "admin.pendingStatus": "लंबित",
        "admin.resolvedStatus": "सुलझी",
        "admin.allClasses": "सभी क्लास",
        "admin.block": "ब्लॉक",
        "admin.floor": "फ्लोर",
        "admin.area": "एरिया",
        "admin.details": "विवरण",
        "admin.status": "स्थिति",
        "admin.media": "फोटो और लोकेशन",
        "admin.classes": "डिटेक्टेड क्लास",
        "admin.actions": "एक्शन",
        "admin.viewImage": "देखें",
        "admin.location": "लोकेशन",
        "admin.resolve": "सुलझाएं",
        "admin.delete": "डिलीट",
        "admin.none": "कुछ नहीं",
        "admin.noLocation": "लोकेशन नहीं",
        "admin.loading": "रिपोर्ट लोड हो रही हैं...",
        "admin.empty": "आपके फिल्टर से कोई रिपोर्ट नहीं मिली।",
        "admin.imageTitle": "डिटेक्टेड कचरे की तस्वीर",
        "admin.deleteConfirm": "क्या आप यह रिपोर्ट डिलीट करना चाहते हैं?",
        "admin.failed": "रिपोर्ट लोड नहीं हो सकीं।"
    }
};

(function () {
    const storageKey = "trashdetectx-language";
    const themeKey = "trashdetectx-theme";

    function currentLang() {
        return localStorage.getItem(storageKey) || "en";
    }

    function currentTheme() {
        return localStorage.getItem(themeKey) || "light";
    }

    function t(key) {
        return translations[currentLang()][key] || translations.en[key] || key;
    }

    function applyTranslations() {
        const lang = currentLang();
        document.documentElement.lang = lang === "hi" ? "hi" : "en";

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            if (translations[lang][key]) el.textContent = translations[lang][key];
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            if (translations[lang][key]) el.placeholder = translations[lang][key];
        });

        document.querySelectorAll("[data-i18n-title]").forEach(el => {
            const key = el.dataset.i18nTitle;
            if (translations[lang][key]) el.title = translations[lang][key];
        });

        document.querySelectorAll("[data-lang-toggle]").forEach(el => {
            el.textContent = t("common.language");
        });

        window.dispatchEvent(new CustomEvent("trashdetectx:languageChanged", { detail: { lang } }));
    }

    function applyTheme() {
        document.documentElement.dataset.theme = currentTheme();
        document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
            const icon = btn.querySelector("i");
            if (icon) icon.className = currentTheme() === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
            btn.setAttribute("aria-label", currentTheme() === "dark" ? "Light mode" : "Dark mode");
        });
    }

    window.TrashDetectX = { t, currentLang, applyTranslations };

    document.addEventListener("DOMContentLoaded", () => {
        applyTheme();
        applyTranslations();

        document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
            btn.addEventListener("click", () => {
                const next = currentTheme() === "dark" ? "light" : "dark";
                localStorage.setItem(themeKey, next);
                applyTheme();
            });
        });

        document.querySelectorAll("[data-lang-toggle]").forEach(btn => {
            btn.addEventListener("click", () => {
                const next = currentLang() === "en" ? "hi" : "en";
                localStorage.setItem(storageKey, next);
                applyTranslations();
                applyTheme();
            });
        });
    });
})();

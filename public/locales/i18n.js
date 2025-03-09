import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation JSON files
import enTranslation from "@/public/locales/en.json";
import faTranslation from "@/public/locales/fa.json";

// Initializing i18n without relying on useDirection directly
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    fa: { translation: faTranslation },
  },
  lng: "en", // Default language (will be updated dynamically)
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

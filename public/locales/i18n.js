import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        tableHeaders: {
          name: "Name",
          type: "Type",
          size: "Size",
          createdBy: "Created By",
          createdDate: "Created Date",
        },
        buttons: {
          upload: "Upload",
          searchPlaceholder: "Search files...",
        },
      },
    },
    fa: {
      translation: {
        tableHeaders: {
          name: "نام فایل",
          type: "نوع",
          size: "سایز",
          createdBy: "ایجاد کننده",
          createdDate: "تاریخ ایجاد",
        },
        buttons: {
          upload: "آپلود",
          searchPlaceholder: "جستجوی فایل‌ها...",
        },
      },
    },
  },
  lng: "fa", // زبان پیش‌فرض
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;

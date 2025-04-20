import { useTranslation } from "react-i18next";

export type Direction = "rtl" | "ltr";

export const useDirection = (): Direction => {
  const { i18n } = useTranslation();
  return i18n.language === "fa" ? "rtl" : "ltr";
}; 
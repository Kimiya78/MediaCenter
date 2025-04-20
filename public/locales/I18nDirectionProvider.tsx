"use client";

import { useEffect } from "react";
import { useDirection } from "@/components/folder-manager/context";
import i18n from "./i18n";

export function I18nDirectionProvider({ children }: { children: React.ReactNode }) {
  const { dir } = useDirection();

  useEffect(() => {
    const newLang = dir === "rtl" ? "fa" : "en"; // Match language with direction
    i18n.changeLanguage(newLang); // Update i18n language dynamically

  }, [dir]);

  return <>{children}</>;
}
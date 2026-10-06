import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { translations } from "../i18n/translations";

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("arogya_lang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    localStorage.setItem("arogya_lang", lang);
  }, [lang]);

  const changeLang = (code) => {
    setLang(code);
  };

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  const translate = (keyPath) => {
    if (!keyPath) return "";
    const parts = keyPath.split(".");
    let current = t;
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return keyPath;
      }
    }
    return typeof current === "string" ? current : keyPath;
  };

  const value = useMemo(
    () => ({
      lang,
      language: lang,
      setLanguage: changeLang,
      changeLang,
      t,
      translate,
    }),
    [lang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

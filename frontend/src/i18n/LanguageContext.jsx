import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./locales/en.json";
import az from "./locales/az.json";

const dictionaries = { en, az };
const LanguageContext = createContext(null);

const STORAGE_KEY = "imfarid_lang";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "az" || saved === "en" ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "az" ? "az" : "en";
  }, [lang]);

  const setLang = (next) => {
    setLangState(next === "az" ? "az" : "en");
  };

  const value = useMemo(() => {
    const dict = dictionaries[lang] || en;

    const t = (key, vars = {}) => {
      const parts = key.split(".");
      let cur = dict;
      for (const part of parts) {
        if (cur && typeof cur === "object" && part in cur) {
          cur = cur[part];
        } else {
          // fallback to English
          let fallback = en;
          for (const p of parts) {
            if (fallback && typeof fallback === "object" && p in fallback) {
              fallback = fallback[p];
            } else {
              return key;
            }
          }
          cur = fallback;
          break;
        }
      }

      if (typeof cur !== "string") return key;

      return cur.replace(/\{\{(\w+)\}\}/g, (_, name) =>
        vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`
      );
    };

    const localize = (item, field) => {
      if (!item) return "";
      if (lang === "az") {
        const azVal = item[`${field}_az`];
        if (azVal !== undefined && azVal !== null && azVal !== "") return azVal;
      }
      return item[field] ?? item[`${field}_az`] ?? "";
    };

    const dateLocale = lang === "az" ? "az-AZ" : "en-US";

    return { lang, setLang, t, localize, dateLocale };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

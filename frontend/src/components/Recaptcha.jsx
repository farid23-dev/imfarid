import { useEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
const SCRIPT_ID = "google-recaptcha-v2";

let scriptPromise = null;

function loadRecaptchaScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.grecaptcha?.render) {
    return Promise.resolve(window.grecaptcha);
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.grecaptcha));
      existing.addEventListener("error", () => reject(new Error("Failed to load reCAPTCHA")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.grecaptcha);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load reCAPTCHA"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function isRecaptchaConfigured() {
  return Boolean(SITE_KEY);
}

export default function Recaptcha({ onChange, onExpire, resetSignal = 0 }) {
  const { t, lang } = useLanguage();
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onChangeRef.current = onChange;
    onExpireRef.current = onExpire;
  }, [onChange, onExpire]);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return undefined;
    let cancelled = false;

    loadRecaptchaScript()
      .then((grecaptcha) => {
        if (cancelled || !containerRef.current) return;
        grecaptcha.ready(() => {
          if (cancelled || !containerRef.current) return;

          if (widgetIdRef.current != null) {
            containerRef.current.innerHTML = "";
            widgetIdRef.current = null;
          }

          widgetIdRef.current = grecaptcha.render(containerRef.current, {
            sitekey: SITE_KEY,
            hl: lang === "az" ? "az" : "en",
            callback: (token) => onChangeRef.current?.(token),
            "expired-callback": () => {
              onExpireRef.current?.();
              onChangeRef.current?.("");
            },
            "error-callback": () => {
              onExpireRef.current?.();
              onChangeRef.current?.("");
            },
          });
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    if (!resetSignal || widgetIdRef.current == null || !window.grecaptcha) return;
    try {
      window.grecaptcha.reset(widgetIdRef.current);
      onChangeRef.current?.("");
    } catch {
      // ignore
    }
  }, [resetSignal]);

  if (!SITE_KEY) {
    return (
      <p className="recaptcha-missing" role="status">
        {t("captcha.notConfigured")}
      </p>
    );
  }

  return <div className="recaptcha" ref={containerRef} />;
}

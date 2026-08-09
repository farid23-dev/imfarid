import { useEffect } from "react";

const SCRIPT_SRC = import.meta.env.VITE_PLAUSIBLE_SCRIPT_SRC;
const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

/**
 * Loads Plausible when configured.
 * Prefer the new site-specific script (VITE_PLAUSIBLE_SCRIPT_SRC).
 * Falls back to legacy script.js + data-domain if only DOMAIN is set.
 * SPA navigations are auto-tracked by Plausible (History API).
 */
export default function Analytics() {
  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    const existing = document.querySelector("script[data-imfarid-plausible]");
    if (existing) return undefined;

    if (SCRIPT_SRC) {
      window.plausible =
        window.plausible ||
        function () {
          (window.plausible.q = window.plausible.q || []).push(arguments);
        };
      window.plausible.init =
        window.plausible.init ||
        function (i) {
          window.plausible.o = i || {};
        };
      window.plausible.init();

      const script = document.createElement("script");
      script.async = true;
      script.dataset.imfaridPlausible = "true";
      script.src = SCRIPT_SRC;
      document.head.appendChild(script);
      return undefined;
    }

    if (!DOMAIN) return undefined;

    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = DOMAIN;
    script.dataset.imfaridPlausible = "true";
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);

    return undefined;
  }, []);

  return null;
}

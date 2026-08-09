import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

/**
 * Loads Plausible only when VITE_PLAUSIBLE_DOMAIN is set.
 * Invisible — no UI chrome. SPA navigations send manual pageviews.
 */
export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!DOMAIN || typeof document === "undefined") return undefined;

    const existing = document.querySelector("script[data-imfarid-plausible]");
    if (existing) return undefined;

    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = DOMAIN;
    script.dataset.imfaridPlausible = "true";
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);

    return undefined;
  }, []);

  useEffect(() => {
    if (!DOMAIN || typeof window === "undefined") return;
    if (typeof window.plausible !== "function") return;
    window.plausible("pageview");
  }, [location.pathname, location.search]);

  return null;
}

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const VISITOR_KEY = "imfarid_vid";

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (id && id.length >= 8) return id;
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v_${Date.now().toString(36)}`;
  }
}

/**
 * Privacy-light first-party analytics: path + anonymous visitor id only.
 * No cookies for ads, no third-party scripts, no paid service.
 */
export default function Analytics() {
  const location = useLocation();
  const lastSent = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathOnly = location.pathname || "/";
    if (pathOnly.startsWith("/admin")) return;

    const key = `${pathOnly}|${location.search || ""}`;
    if (lastSent.current === key) return;
    lastSent.current = key;

    const body = JSON.stringify({
      path: pathOnly,
      visitorId: getVisitorId(),
    });

    fetch(`${API_URL}/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [location.pathname, location.search]);

  return null;
}

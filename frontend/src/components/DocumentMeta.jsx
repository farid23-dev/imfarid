import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { applyPageMeta } from "../utils/seo";

const ROUTE_KEYS = {
  "/": "home",
  "/about": "about",
  "/services": "services",
  "/projects": "projects",
  "/contact": "contact",
  "/blog": "blog",
};

/**
 * Sets per-route document title / meta. Does not change page layout.
 */
export default function DocumentMeta() {
  const { pathname } = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      applyPageMeta({
        title: t("seo.adminTitle"),
        description: t("seo.defaultDescription"),
        path: pathname,
        noindex: true,
      });
      return;
    }

    // Blog posts set their own meta when content loads
    if (pathname.startsWith("/blog/") && pathname !== "/blog/") {
      applyPageMeta({
        title: t("seo.blogPostFallbackTitle"),
        description: t("seo.blog.description"),
        path: pathname,
        type: "article",
      });
      return;
    }

    const key = ROUTE_KEYS[pathname] || "home";
    applyPageMeta({
      title: t(`seo.${key}.title`),
      description: t(`seo.${key}.description`),
      path: pathname,
    });
  }, [pathname, t]);

  return null;
}

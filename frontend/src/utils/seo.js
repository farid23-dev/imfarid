const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://imfarid.com").replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/project-1.png`;

const upsertMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export function getSiteUrl() {
  return SITE_URL;
}

export function absoluteUrl(pathOrUrl = "/") {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

/**
 * Updates document title + meta/OG tags in the browser.
 * Layout/visual UI is unchanged; tab title and share metadata update only.
 */
export function applyPageMeta({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
} = {}) {
  if (title) document.title = title;

  if (description) {
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:description", description);
    upsertMeta("name", "twitter:description", description);
  }

  if (title) {
    upsertMeta("property", "og:title", title);
    upsertMeta("name", "twitter:title", title);
  }

  const url = absoluteUrl(path || window.location.pathname);
  upsertMeta("property", "og:url", url);
  upsertLink("canonical", url);

  const imageUrl = absoluteUrl(image || DEFAULT_IMAGE);
  upsertMeta("property", "og:image", imageUrl);
  upsertMeta("name", "twitter:image", imageUrl);
  upsertMeta("property", "og:type", type);
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("property", "og:site_name", "imfarid.com");

  upsertMeta(
    "name",
    "robots",
    noindex ? "noindex, nofollow" : "index, follow"
  );
}

import express from "express";
import { supabase } from "../config/supabase.js";
import defaultPosts from "../data/defaultPosts.js";

const router = express.Router();

const SITE_URL = (process.env.SITE_URL || "https://imfarid.com").replace(/\/$/, "");

const STATIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/contact",
  "/blog",
];

const xmlEscape = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urlEntry = (loc, lastmod, priority = "0.7") => {
  const lastmodTag = lastmod
    ? `\n    <lastmod>${xmlEscape(new Date(lastmod).toISOString().slice(0, 10))}</lastmod>`
    : "";
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmodTag}
    <priority>${priority}</priority>
  </url>`;
};

const collectSlugs = async () => {
  const posts = [];

  if (supabase) {
    const postsRes = await supabase
      .from("posts")
      .select("slug, updated_at, created_at, published")
      .eq("published", true);

    if (!postsRes.error && postsRes.data) {
      posts.push(...postsRes.data);
    }
  }

  if (!posts.length) {
    posts.push(...defaultPosts.filter((p) => p.published !== false));
  }

  return { posts };
};

const buildSitemap = async () => {
  const { posts } = await collectSlugs();
  const entries = [
    ...STATIC_PATHS.map((path, index) =>
      urlEntry(`${SITE_URL}${path}`, null, index === 0 ? "1.0" : "0.8")
    ),
    ...posts
      .filter((p) => p.slug)
      .map((p) =>
        urlEntry(
          `${SITE_URL}/blog/${p.slug}`,
          p.updated_at || p.created_at,
          "0.6"
        )
      ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
};

router.get(["/", "/sitemap.xml"], async (_req, res) => {
  try {
    const xml = await buildSitemap();
    res.type("application/xml").send(xml);
  } catch (error) {
    console.error("Error building sitemap:", error);
    res.status(500).type("text/plain").send("Failed to build sitemap");
  }
});

export default router;

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "../config/supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const analyticsFile = path.join(__dirname, "../data/page-views.json");
const RETENTION_DAYS = 120;

const useSupabase = () => Boolean(supabase);

const loadFile = () => {
  try {
    if (fs.existsSync(analyticsFile)) {
      const data = JSON.parse(fs.readFileSync(analyticsFile, "utf8"));
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.warn("Failed to load page views file:", error.message);
  }
  return [];
};

const saveFile = (rows) => {
  try {
    fs.writeFileSync(analyticsFile, JSON.stringify(rows, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save page views file:", error.message);
  }
};

let fileRows = loadFile();
let nextId = Math.max(0, ...fileRows.map((r) => Number(r.id) || 0)) + 1;

const pruneFile = () => {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const before = fileRows.length;
  fileRows = fileRows.filter((r) => new Date(r.created_at).getTime() >= cutoff);
  if (fileRows.length !== before) saveFile(fileRows);
};

const normalizePath = (raw) => {
  if (!raw || typeof raw !== "string") return "/";
  let p = raw.trim();
  try {
    if (p.startsWith("http://") || p.startsWith("https://")) {
      p = new URL(p).pathname;
    }
  } catch {
    /* ignore */
  }
  p = p.split("?")[0].split("#")[0] || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p.length > 300) p = p.slice(0, 300);
  return p;
};

const isTrackablePath = (p) => {
  if (!p) return false;
  if (p.startsWith("/admin")) return false;
  if (p.startsWith("/api")) return false;
  if (p.includes(".")) return false; // assets like /foo.js
  return true;
};

const periodToCutoff = (period) => {
  const now = new Date();
  const start = new Date(now);
  if (period === "7d") start.setDate(start.getDate() - 7);
  else if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "6mo") start.setMonth(start.getMonth() - 6);
  else if (period === "12mo") start.setFullYear(start.getFullYear() - 1);
  else start.setDate(start.getDate() - 30); // 30d default
  return start;
};

const dayKey = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const aggregate = (rows, period) => {
  const cutoff = periodToCutoff(period);
  const filtered = rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return !Number.isNaN(t) && t >= cutoff.getTime();
  });

  const visitors = new Set();
  const byDay = new Map();
  const byPage = new Map();

  for (const row of filtered) {
    const pathName = row.path || "/";
    const visitor = row.visitor_id || "";
    if (visitor) visitors.add(visitor);

    const day = dayKey(row.created_at);
    if (day) {
      const cur = byDay.get(day) || { date: day, visitors: new Set(), pageviews: 0 };
      cur.pageviews += 1;
      if (visitor) cur.visitors.add(visitor);
      byDay.set(day, cur);
    }

    const page = byPage.get(pathName) || {
      page: pathName,
      visitors: new Set(),
      pageviews: 0,
    };
    page.pageviews += 1;
    if (visitor) page.visitors.add(visitor);
    byPage.set(pathName, page);
  }

  const timeseries = [...byDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      visitors: d.visitors.size,
      pageviews: d.pageviews,
    }));

  const topPages = [...byPage.values()]
    .map((p) => ({
      page: p.page,
      visitors: p.visitors.size,
      pageviews: p.pageviews,
    }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 15);

  const blogPosts = topPages
    .filter((p) => /^\/blog\/.+/.test(p.page))
    .slice(0, 10);

  return {
    configured: true,
    provider: "self",
    period,
    aggregate: {
      visitors: visitors.size,
      pageviews: filtered.length,
      visits: visitors.size,
      bounceRate: null,
      visitDuration: null,
    },
    timeseries,
    topPages,
    blogPosts,
    sources: [],
  };
};

export const recordPageView = async ({ path: rawPath, visitorId }) => {
  const pathName = normalizePath(rawPath);
  if (!isTrackablePath(pathName)) return { ok: false, skipped: true };
  if (!visitorId || typeof visitorId !== "string" || visitorId.length > 80) {
    return { ok: false, skipped: true };
  }

  const cleanVisitor = visitorId.replace(/[^\w-]/g, "").slice(0, 64);
  if (!cleanVisitor) return { ok: false, skipped: true };

  const row = {
    path: pathName,
    visitor_id: cleanVisitor,
    created_at: new Date().toISOString(),
  };

  if (useSupabase()) {
    const { error } = await supabase.from("page_views").insert(row);
    if (!error) return { ok: true };
    console.warn("Supabase page_views insert failed, using file:", error.message);
  }

  pruneFile();
  fileRows.push({ id: nextId++, ...row });
  saveFile(fileRows);
  return { ok: true };
};

export const getAnalyticsSummary = async (period = "30d") => {
  const cutoff = periodToCutoff(period);

  if (useSupabase()) {
    const { data, error } = await supabase
      .from("page_views")
      .select("path, visitor_id, created_at")
      .gte("created_at", cutoff.toISOString())
      .order("created_at", { ascending: true })
      .limit(50000);

    if (!error && data) {
      return aggregate(data, period);
    }
    console.warn("Supabase analytics read failed, using file:", error?.message);
  }

  pruneFile();
  return aggregate(fileRows, period);
};

export { normalizePath, isTrackablePath };

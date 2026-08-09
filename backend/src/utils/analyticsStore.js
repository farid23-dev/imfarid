import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "../config/supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const analyticsFile = path.join(__dirname, "../data/page-views.json");
const RETENTION_DAYS = 120;
const SESSION_GAP_MS = 30 * 60 * 1000;
const REALTIME_MS = 5 * 60 * 1000;

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

export const normalizePath = (raw) => {
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

export const isTrackablePath = (p) => {
  if (!p) return false;
  if (p.startsWith("/admin")) return false;
  if (p.startsWith("/api")) return false;
  if (p.includes(".")) return false;
  return true;
};

export const parseUserAgent = (ua = "") => {
  const s = String(ua || "").toLowerCase();
  let device = "desktop";
  if (/ipad|tablet|kindle|playbook/.test(s)) device = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) device = "mobile";
  else if (/android/.test(s)) device = "tablet";

  let browser = "Other";
  if (s.includes("edg/") || s.includes("edge/")) browser = "Edge";
  else if (s.includes("opr/") || s.includes("opera")) browser = "Opera";
  else if (s.includes("chrome/") || s.includes("crios/")) browser = "Chrome";
  else if (s.includes("firefox/") || s.includes("fxios/")) browser = "Firefox";
  else if (s.includes("safari/") && !s.includes("chrome") && !s.includes("crios")) {
    browser = "Safari";
  }

  return { device, browser };
};

const periodToCutoff = (period, from = new Date()) => {
  const start = new Date(from);
  if (period === "7d") start.setDate(start.getDate() - 7);
  else if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "6mo") start.setMonth(start.getMonth() - 6);
  else if (period === "12mo") start.setFullYear(start.getFullYear() - 1);
  else start.setDate(start.getDate() - 30);
  return start;
};

const dayKey = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const inRange = (iso, start, end) => {
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t >= start.getTime() && t < end.getTime();
};

const buildSessions = (rows) => {
  const byVisitor = new Map();
  for (const row of rows) {
    const vid = row.visitor_id || "";
    if (!vid) continue;
    if (!byVisitor.has(vid)) byVisitor.set(vid, []);
    byVisitor.get(vid).push(row);
  }

  const sessions = [];
  for (const [, list] of byVisitor) {
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let current = null;
    for (const hit of list) {
      const t = new Date(hit.created_at).getTime();
      if (!current || t - current.lastAt > SESSION_GAP_MS) {
        current = {
          visitor_id: hit.visitor_id,
          hits: 1,
          startAt: t,
          lastAt: t,
        };
        sessions.push(current);
      } else {
        current.hits += 1;
        current.lastAt = t;
      }
    }
  }
  return sessions;
};

const summarizeRows = (rows) => {
  const visitors = new Set();
  const byDay = new Map();
  const byPage = new Map();
  const byDevice = new Map();
  const byBrowser = new Map();

  for (const row of rows) {
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

    const device = row.device || "desktop";
    const browser = row.browser || "Other";
    byDevice.set(device, (byDevice.get(device) || 0) + 1);
    byBrowser.set(browser, (byBrowser.get(browser) || 0) + 1);
  }

  const sessions = buildSessions(rows);
  const bounced = sessions.filter((s) => s.hits === 1).length;
  const bounceRate = sessions.length
    ? Math.round((bounced / sessions.length) * 1000) / 10
    : null;
  const pagesPerVisit = sessions.length
    ? Math.round((rows.length / sessions.length) * 10) / 10
    : null;
  const durations = sessions
    .filter((s) => s.hits > 1)
    .map((s) => (s.lastAt - s.startAt) / 1000);
  const visitDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : null;

  const toShareList = (map) => {
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    return [...map.entries()]
      .map(([name, count]) => ({
        name,
        count,
        share: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const topPages = [...byPage.values()]
    .map((p) => ({
      page: p.page,
      visitors: p.visitors.size,
      pageviews: p.pageviews,
    }))
    .sort((a, b) => b.pageviews - a.pageviews)
    .slice(0, 15);

  return {
    aggregate: {
      visitors: visitors.size,
      pageviews: rows.length,
      sessions: sessions.length,
      bounceRate,
      pagesPerVisit,
      visitDuration,
      visits: sessions.length,
    },
    timeseries: [...byDay.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        date: d.date,
        visitors: d.visitors.size,
        pageviews: d.pageviews,
      })),
    topPages,
    blogPosts: topPages.filter((p) => /^\/blog\/.+/.test(p.page)).slice(0, 10),
    devices: toShareList(byDevice),
    browsers: toShareList(byBrowser),
  };
};

const pctChange = (current, previous) => {
  if (previous == null || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const loadRowsSince = async (sinceIso) => {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from("page_views")
      .select("path, visitor_id, created_at, device, browser")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .limit(100000);

    if (!error && data) return data;

    // Older schemas without device/browser columns
    const fallback = await supabase
      .from("page_views")
      .select("path, visitor_id, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .limit(100000);

    if (!fallback.error && fallback.data) {
      return fallback.data.map((r) => ({
        ...r,
        device: "desktop",
        browser: "Other",
      }));
    }
    console.warn("Supabase analytics read failed, using file:", error?.message);
  }

  pruneFile();
  return fileRows.filter((r) => new Date(r.created_at).getTime() >= new Date(sinceIso).getTime());
};

export const recordPageView = async ({ path: rawPath, visitorId, userAgent }) => {
  const pathName = normalizePath(rawPath);
  if (!isTrackablePath(pathName)) return { ok: false, skipped: true };
  if (!visitorId || typeof visitorId !== "string" || visitorId.length > 80) {
    return { ok: false, skipped: true };
  }

  const cleanVisitor = visitorId.replace(/[^\w-]/g, "").slice(0, 64);
  if (!cleanVisitor) return { ok: false, skipped: true };

  const { device, browser } = parseUserAgent(userAgent);
  const row = {
    path: pathName,
    visitor_id: cleanVisitor,
    device,
    browser,
    created_at: new Date().toISOString(),
  };

  if (useSupabase()) {
    const { error } = await supabase.from("page_views").insert(row);
    if (!error) return { ok: true };

    // Retry without optional columns if migration not applied yet
    const { error: basicError } = await supabase.from("page_views").insert({
      path: row.path,
      visitor_id: row.visitor_id,
      created_at: row.created_at,
    });
    if (!basicError) return { ok: true };
    console.warn("Supabase page_views insert failed, using file:", error.message);
  }

  pruneFile();
  fileRows.push({ id: nextId++, ...row });
  saveFile(fileRows);
  return { ok: true };
};

export const getAnalyticsSummary = async (period = "30d") => {
  const end = new Date();
  const start = periodToCutoff(period, end);
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(start.getTime() - duration);

  // Need rows back to prevStart for comparison + realtime uses recent slice
  const all = await loadRowsSince(prevStart.toISOString());
  const currentRows = all.filter((r) => inRange(r.created_at, start, end));
  const previousRows = all.filter((r) => inRange(r.created_at, prevStart, prevEnd));

  const current = summarizeRows(currentRows);
  const previous = summarizeRows(previousRows);

  const realtimeCutoff = Date.now() - REALTIME_MS;
  const liveVisitors = new Set(
    all
      .filter((r) => new Date(r.created_at).getTime() >= realtimeCutoff)
      .map((r) => r.visitor_id)
      .filter(Boolean)
  );

  return {
    configured: true,
    provider: "self",
    period,
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      previousStart: prevStart.toISOString(),
      previousEnd: prevEnd.toISOString(),
    },
    realtime: {
      visitors: liveVisitors.size,
      windowMinutes: 5,
    },
    aggregate: current.aggregate,
    comparison: {
      visitors: pctChange(current.aggregate.visitors, previous.aggregate.visitors),
      pageviews: pctChange(current.aggregate.pageviews, previous.aggregate.pageviews),
      sessions: pctChange(current.aggregate.sessions, previous.aggregate.sessions),
      bounceRate: pctChange(
        current.aggregate.bounceRate ?? 0,
        previous.aggregate.bounceRate ?? 0
      ),
      previous: previous.aggregate,
    },
    timeseries: current.timeseries,
    topPages: current.topPages,
    blogPosts: current.blogPosts,
    devices: current.devices,
    browsers: current.browsers,
    sources: [],
  };
};

export const getBlogViewCounts = async (slugs = []) => {
  const unique = [...new Set(slugs.filter(Boolean).map(String))];
  const counts = Object.fromEntries(unique.map((s) => [s, 0]));
  if (!unique.length) return counts;

  const paths = unique.map((s) => `/blog/${s}`);

  if (useSupabase()) {
    const { data, error } = await supabase
      .from("page_views")
      .select("path")
      .in("path", paths);

    if (!error && data) {
      for (const row of data) {
        const slug = String(row.path || "").replace(/^\/blog\//, "");
        if (slug in counts) counts[slug] += 1;
      }
      return counts;
    }
    console.warn("Supabase blog view counts failed, using file:", error?.message);
  }

  pruneFile();
  for (const row of fileRows) {
    const slug = String(row.path || "").replace(/^\/blog\//, "");
    if (slug in counts) counts[slug] += 1;
  }
  return counts;
};

export const attachViewCounts = async (items) => {
  if (!Array.isArray(items) || !items.length) return items || [];
  const counts = await getBlogViewCounts(items.map((p) => p.slug));
  return items.map((p) => ({
    ...p,
    view_count: counts[p.slug] || 0,
  }));
};

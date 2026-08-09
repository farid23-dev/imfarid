import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const PLAUSIBLE_API = "https://plausible.io/api/v1/stats";

function getConfig() {
  const siteId = process.env.PLAUSIBLE_SITE_ID || process.env.PLAUSIBLE_DOMAIN || "";
  const apiKey = process.env.PLAUSIBLE_API_KEY || "";
  const sharedLink = process.env.PLAUSIBLE_SHARED_LINK || "";
  return { siteId, apiKey, sharedLink };
}

async function plausibleFetch(path, apiKey) {
  const response = await fetch(`${PLAUSIBLE_API}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || "Invalid response from Plausible" };
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Plausible API error (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return data;
}

function resultsList(payload) {
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload)) return payload;
  return [];
}

router.get("/", authMiddleware, async (req, res) => {
  const { siteId, apiKey, sharedLink } = getConfig();
  const period = ["7d", "30d", "month", "6mo", "12mo"].includes(req.query.period)
    ? req.query.period
    : "30d";

  if (!siteId || !apiKey) {
    return res.json({
      configured: false,
      period,
      siteId: siteId || null,
      sharedLink: sharedLink || null,
      message:
        "Add PLAUSIBLE_SITE_ID and PLAUSIBLE_API_KEY to backend/.env, then restart the API.",
    });
  }

  try {
    const metrics = "visitors,pageviews,bounce_rate,visit_duration,visits";
    const qs = `site_id=${encodeURIComponent(siteId)}&period=${period}`;

    const [aggregate, timeseries, pages, sources] = await Promise.all([
      plausibleFetch(`/aggregate?${qs}&metrics=${metrics}`, apiKey),
      plausibleFetch(`/timeseries?${qs}&metrics=visitors,pageviews`, apiKey),
      plausibleFetch(
        `/breakdown?${qs}&property=event:page&metrics=visitors,pageviews&limit=15`,
        apiKey
      ),
      plausibleFetch(
        `/breakdown?${qs}&property=visit:source&metrics=visitors,pageviews&limit=10`,
        apiKey
      ),
    ]);

    const results = aggregate?.results || {};
    const pageRows = resultsList(pages).map((row) => ({
      page: row.page || row.name || "/",
      visitors: row.visitors || 0,
      pageviews: row.pageviews || 0,
    }));

    const blogPosts = pageRows
      .filter((row) => /^\/blog\/.+/.test(row.page) && !row.page.endsWith("/blog"))
      .slice(0, 10);

    return res.json({
      configured: true,
      period,
      siteId,
      sharedLink: sharedLink || null,
      aggregate: {
        visitors: results.visitors?.value ?? results.visitors ?? 0,
        pageviews: results.pageviews?.value ?? results.pageviews ?? 0,
        bounceRate: results.bounce_rate?.value ?? results.bounce_rate ?? null,
        visitDuration:
          results.visit_duration?.value ?? results.visit_duration ?? null,
        visits: results.visits?.value ?? results.visits ?? 0,
      },
      timeseries: resultsList(timeseries).map((row) => ({
        date: row.date,
        visitors: row.visitors || 0,
        pageviews: row.pageviews || 0,
      })),
      topPages: pageRows,
      blogPosts,
      sources: resultsList(sources).map((row) => ({
        source: row.source || row.name || "Direct / None",
        visitors: row.visitors || 0,
        pageviews: row.pageviews || 0,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error.message);
    return res.status(error.status && error.status < 500 ? error.status : 502).json({
      configured: true,
      period,
      siteId,
      sharedLink: sharedLink || null,
      error: error.message || "Failed to load Plausible stats",
    });
  }
});

export default router;

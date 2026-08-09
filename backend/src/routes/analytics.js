import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getAnalyticsSummary, recordPageView } from "../utils/analyticsStore.js";

const router = Router();

const recentHits = new Map();
const RATE_WINDOW_MS = 4000;

function allowHit(visitorId, path) {
  const key = `${visitorId}:${path}`;
  const now = Date.now();
  const last = recentHits.get(key) || 0;
  if (now - last < RATE_WINDOW_MS) return false;
  recentHits.set(key, now);
  if (recentHits.size > 5000) {
    for (const [k, t] of recentHits) {
      if (now - t > RATE_WINDOW_MS * 5) recentHits.delete(k);
    }
  }
  return true;
}

router.post("/pageview", async (req, res) => {
  try {
    const path = req.body?.path;
    const visitorId = req.body?.visitorId;
    if (!visitorId || !path) {
      return res.status(400).json({ error: "path and visitorId required" });
    }
    if (!allowHit(String(visitorId), String(path))) {
      return res.json({ ok: true, deduped: true });
    }
    const result = await recordPageView({
      path,
      visitorId,
      userAgent: req.get("user-agent") || "",
    });
    return res.json(result);
  } catch (error) {
    console.error("pageview error:", error.message);
    return res.status(500).json({ error: "Failed to record pageview" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const period = ["7d", "30d", "month", "6mo", "12mo"].includes(req.query.period)
    ? req.query.period
    : "30d";

  try {
    const summary = await getAnalyticsSummary(period);
    return res.json(summary);
  } catch (error) {
    console.error("analytics summary error:", error.message);
    return res.status(500).json({
      configured: true,
      period,
      error: error.message || "Failed to load analytics",
    });
  }
});

export default router;

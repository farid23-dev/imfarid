import express from "express";
import crypto from "crypto";
import {
  getLikeCount,
  hasLiked,
  toggleLike,
  getLikesSummary,
} from "../utils/likesStore.js";

const router = express.Router();
const COOKIE_NAME = "imfarid_vid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("=") || "");
    return acc;
  }, {});
};

const getOrCreateVisitorId = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  let visitorId = cookies[COOKIE_NAME] || req.headers["x-visitor-id"];

  if (!visitorId || visitorId.length < 8) {
    visitorId = crypto.randomUUID();
    res.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${encodeURIComponent(visitorId)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
    );
  }

  return visitorId;
};

// Admin / dashboard summary
router.get("/summary", (req, res) => {
  res.json(getLikesSummary());
});

// Get like state for one item
router.get("/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const visitorId = getOrCreateVisitorId(req, res);

  if (!["posts", "projects", "post", "project"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  res.json({
    count: getLikeCount(type, id),
    liked: hasLiked(type, id, visitorId),
  });
});

// Toggle like (one like per visitor cookie)
router.post("/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const visitorId = getOrCreateVisitorId(req, res);

  if (!["posts", "projects", "post", "project"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  const result = toggleLike(type, id, visitorId);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json(result);
});

export default router;

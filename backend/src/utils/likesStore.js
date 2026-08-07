import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const likesFile = path.join(__dirname, "../data/likes.json");

const emptyStore = () => ({
  posts: {},
  projects: {},
});

export const loadLikes = () => {
  try {
    if (fs.existsSync(likesFile)) {
      const data = JSON.parse(fs.readFileSync(likesFile, "utf8"));
      return {
        posts: data.posts || {},
        projects: data.projects || {},
      };
    }
  } catch (error) {
    console.warn("Failed to load likes file:", error.message);
  }
  return emptyStore();
};

export const saveLikes = (store) => {
  try {
    fs.writeFileSync(likesFile, JSON.stringify(store, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save likes file:", error.message);
  }
};

let store = loadLikes();

const normalizeType = (type) => {
  if (type === "post" || type === "posts") return "posts";
  if (type === "project" || type === "projects") return "projects";
  return null;
};

export const getLikeCount = (type, id) => {
  const key = normalizeType(type);
  if (!key) return 0;
  const list = store[key][String(id)] || [];
  return list.length;
};

export const hasLiked = (type, id, visitorId) => {
  if (!visitorId) return false;
  const key = normalizeType(type);
  if (!key) return false;
  const list = store[key][String(id)] || [];
  return list.includes(visitorId);
};

export const toggleLike = (type, id, visitorId) => {
  const key = normalizeType(type);
  if (!key || !visitorId) {
    return { count: 0, liked: false, error: "Invalid like request" };
  }

  const itemId = String(id);
  if (!store[key][itemId]) {
    store[key][itemId] = [];
  }

  const list = store[key][itemId];
  const index = list.indexOf(visitorId);
  let liked;

  if (index >= 0) {
    list.splice(index, 1);
    liked = false;
  } else {
    list.push(visitorId);
    liked = true;
  }

  saveLikes(store);
  return { count: list.length, liked };
};

export const getLikesSummary = () => {
  const mapCounts = (bucket) => {
    const result = {};
    let total = 0;
    for (const [id, visitors] of Object.entries(bucket)) {
      const count = visitors.length;
      result[id] = count;
      total += count;
    }
    return { counts: result, total };
  };

  const posts = mapCounts(store.posts);
  const projects = mapCounts(store.projects);

  return {
    posts: posts.counts,
    projects: projects.counts,
    totals: {
      posts: posts.total,
      projects: projects.total,
      all: posts.total + projects.total,
    },
  };
};

export const attachLikeCounts = (type, items = []) => {
  return items.map((item) => ({
    ...item,
    like_count: getLikeCount(type, item.id),
  }));
};

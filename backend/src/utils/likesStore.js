import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "../config/supabase.js";

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

export const saveLikes = (next) => {
  try {
    fs.writeFileSync(likesFile, JSON.stringify(next, null, 2), "utf8");
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

const useSupabase = () => Boolean(supabase);

export const getLikeCount = async (type, id) => {
  const key = normalizeType(type);
  if (!key) return 0;

  if (useSupabase()) {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("item_type", key)
      .eq("item_id", String(id));

    if (!error) return count || 0;
    console.warn("Supabase getLikeCount failed, using file store:", error.message);
  }

  const list = store[key][String(id)] || [];
  return list.length;
};

export const hasLiked = async (type, id, visitorId) => {
  if (!visitorId) return false;
  const key = normalizeType(type);
  if (!key) return false;

  if (useSupabase()) {
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("item_type", key)
      .eq("item_id", String(id))
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (!error) return Boolean(data);
    console.warn("Supabase hasLiked failed, using file store:", error.message);
  }

  const list = store[key][String(id)] || [];
  return list.includes(visitorId);
};

export const toggleLike = async (type, id, visitorId) => {
  const key = normalizeType(type);
  if (!key || !visitorId) {
    return { count: 0, liked: false, error: "Invalid like request" };
  }

  const itemId = String(id);

  if (useSupabase()) {
    const { data: existing, error: findError } = await supabase
      .from("likes")
      .select("id")
      .eq("item_type", key)
      .eq("item_id", itemId)
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (findError) {
      console.warn("Supabase toggleLike lookup failed, using file store:", findError.message);
    } else if (existing) {
      const { error: deleteError } = await supabase.from("likes").delete().eq("id", existing.id);
      if (deleteError) {
        console.warn("Supabase unlike failed, using file store:", deleteError.message);
      } else {
        const count = await getLikeCount(key, itemId);
        return { count, liked: false };
      }
    } else {
      const { error: insertError } = await supabase.from("likes").insert([
        {
          item_type: key,
          item_id: itemId,
          visitor_id: visitorId,
        },
      ]);

      if (insertError) {
        console.warn("Supabase like failed, using file store:", insertError.message);
      } else {
        const count = await getLikeCount(key, itemId);
        return { count, liked: true };
      }
    }
  }

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

export const getLikesSummary = async () => {
  if (useSupabase()) {
    const { data, error } = await supabase.from("likes").select("item_type, item_id");

    if (!error && data) {
      const posts = {};
      const projects = {};
      let postsTotal = 0;
      let projectsTotal = 0;

      for (const row of data) {
        if (row.item_type === "posts") {
          posts[row.item_id] = (posts[row.item_id] || 0) + 1;
          postsTotal += 1;
        } else if (row.item_type === "projects") {
          projects[row.item_id] = (projects[row.item_id] || 0) + 1;
          projectsTotal += 1;
        }
      }

      return {
        posts,
        projects,
        totals: {
          posts: postsTotal,
          projects: projectsTotal,
          all: postsTotal + projectsTotal,
        },
      };
    }
    console.warn("Supabase getLikesSummary failed, using file store:", error?.message);
  }

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

export const attachLikeCounts = async (type, items = []) => {
  const key = normalizeType(type);
  if (!items.length || !key) {
    return items.map((item) => ({ ...item, like_count: item.like_count || 0 }));
  }

  if (useSupabase()) {
    const ids = items.map((item) => String(item.id));
    const { data, error } = await supabase
      .from("likes")
      .select("item_id")
      .eq("item_type", key)
      .in("item_id", ids);

    if (!error) {
      const counts = {};
      for (const row of data || []) {
        counts[row.item_id] = (counts[row.item_id] || 0) + 1;
      }
      return items.map((item) => ({
        ...item,
        like_count: counts[String(item.id)] || 0,
      }));
    }
    console.warn("Supabase attachLikeCounts failed, using file store:", error.message);
  }

  return items.map((item) => ({
    ...item,
    like_count: (store[key][String(item.id)] || []).length,
  }));
};

export const removeLikesForItem = async (type, id) => {
  const key = normalizeType(type);
  if (!key || id === undefined || id === null) return 0;

  const itemId = String(id);

  if (useSupabase()) {
    const { data, error } = await supabase
      .from("likes")
      .delete()
      .eq("item_type", key)
      .eq("item_id", itemId)
      .select("id");

    if (!error) {
      return data?.length || 0;
    }
    console.warn("Supabase removeLikesForItem failed, using file store:", error.message);
  }

  const removed = (store[key][itemId] || []).length;
  if (store[key][itemId]) {
    delete store[key][itemId];
    saveLikes(store);
  }
  return removed;
};

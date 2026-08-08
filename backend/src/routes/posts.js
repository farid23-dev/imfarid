import express from "express";
import { supabase } from "../config/supabase.js";
import defaultPosts from "../data/defaultPosts.js";
import { attachLikeCounts, getLikeCount, removeLikesForItem } from "../utils/likesStore.js";
import { missingAzError } from "../utils/requireAz.js";
import {
  attachCommentCounts,
  getCommentCount,
  removeCommentsForPost,
} from "../utils/commentsStore.js";

const withPostMeta = (items) => attachCommentCounts(attachLikeCounts("posts", items));
const withSinglePostMeta = (post) => ({
  ...post,
  like_count: getLikeCount("posts", post.id),
  comment_count: getCommentCount(post.id),
});

const router = express.Router();

let posts = defaultPosts.map((p, index) => ({
  ...p,
  sort_order: p.sort_order ?? index,
}));
let nextId = Math.max(0, ...posts.map((p) => p.id)) + 1;

const sortByOrder = (list) =>
  [...list].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

const nextTopSortOrder = (list) => {
  if (!list.length) return 0;
  return Math.min(...list.map((item) => item.sort_order ?? 0)) - 1;
};

const applyOrder = async (ids) => {
  ids.forEach((id, index) => {
    const item = posts.find((p) => String(p.id) === String(id));
    if (item) item.sort_order = index;
  });
  posts = sortByOrder(posts);

  if (supabase) {
    await Promise.all(
      ids.map((id, index) =>
        supabase.from("posts").update({ sort_order: index }).eq("id", id)
      )
    );
  }
};

// GET all posts
// Use ?all=true for admin (includes drafts)
router.get("/", async (req, res) => {
  const includeDrafts = req.query.all === "true";

  try {
    if (supabase) {
      let query = supabase
        .from("posts")
        .select(includeDrafts ? "*" : "id, title, title_az, slug, excerpt, excerpt_az, cover_image, published, created_at, sort_order")
        .order("sort_order", { ascending: true });

      if (!includeDrafts) {
        query = query.eq("published", true);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return res.json(withPostMeta(data));
      }
    }

    const list = sortByOrder(includeDrafts ? posts : posts.filter((p) => p.published));

    if (includeDrafts) {
      return res.json(withPostMeta(list));
    }

    const postsPreview = list.map(
      ({ id, title, title_az, slug, excerpt, excerpt_az, cover_image, published, created_at, sort_order }) => ({
        id,
        title,
        title_az,
        slug,
        excerpt,
        excerpt_az,
        cover_image,
        published,
        created_at,
        sort_order,
      })
    );

    res.json(withPostMeta(postsPreview));
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Reorder posts
router.put("/reorder", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids array is required" });
  }

  try {
    await applyOrder(ids);
    res.json({ success: true, items: sortByOrder(posts) });
  } catch (error) {
    console.error("Error reordering posts:", error);
    res.status(500).json({ error: "Failed to reorder posts" });
  }
});

// GET single post by slug
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return res.json(withSinglePostMeta(data));
      }
    }

    const post = posts.find((p) => p.slug === slug);
    if (post) return res.json(withSinglePostMeta(post));

    res.status(404).json({ error: "Post not found" });
  } catch (error) {
    console.error("Error fetching post:", error);
    const post = posts.find((p) => p.slug === slug);
    if (post) return res.json(withSinglePostMeta(post));
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST create new post
router.post("/", async (req, res) => {
  const {
    title,
    title_az,
    slug,
    excerpt,
    excerpt_az,
    content,
    content_az,
    cover_image,
    published,
  } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ error: "Title, slug, and content are required" });
  }

  const azError = missingAzError({
    "Title (AZ)": title_az,
    "Content (AZ)": content_az,
    ...(String(excerpt || "").trim() ? { "Excerpt (AZ)": excerpt_az } : {}),
  });
  if (azError) {
    return res.status(400).json({ error: azError });
  }

  try {
    const now = new Date().toISOString();
    const topSort = nextTopSortOrder(posts);

    if (supabase) {
      const { data, error } = await supabase
        .from("posts")
        .insert([{
          title,
          title_az: title_az || null,
          slug,
          excerpt,
          excerpt_az: excerpt_az || null,
          content,
          content_az: content_az || null,
          cover_image,
          published: published || false,
          sort_order: topSort,
        }])
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json(data);
      }
      console.warn("Supabase create post failed, using memory:", error?.message);
    }

    const newPost = {
      id: nextId++,
      title,
      title_az: title_az || "",
      slug,
      excerpt: excerpt || "",
      excerpt_az: excerpt_az || "",
      content,
      content_az: content_az || "",
      cover_image: cover_image || null,
      published: published || false,
      sort_order: topSort,
      created_at: now,
      updated_at: now,
    };
    posts.unshift(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT update post
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    title_az,
    slug,
    excerpt,
    excerpt_az,
    content,
    content_az,
    cover_image,
    published,
    sort_order,
  } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ error: "Title, slug, and content are required" });
  }

  const azError = missingAzError({
    "Title (AZ)": title_az,
    "Content (AZ)": content_az,
    ...(String(excerpt || "").trim() ? { "Excerpt (AZ)": excerpt_az } : {}),
  });
  if (azError) {
    return res.status(400).json({ error: azError });
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("posts")
        .update({
          title,
          title_az,
          slug,
          excerpt,
          excerpt_az,
          content,
          content_az,
          cover_image,
          published,
          sort_order,
          updated_at: new Date(),
        })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return res.json(data);
      }
      console.warn("Supabase update post failed, using memory:", error?.message);
    }

    const index = posts.findIndex((p) => String(p.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: "Post not found" });
    }

    posts[index] = {
      ...posts[index],
      title: title ?? posts[index].title,
      title_az: title_az ?? posts[index].title_az,
      slug: slug ?? posts[index].slug,
      excerpt: excerpt ?? posts[index].excerpt,
      excerpt_az: excerpt_az ?? posts[index].excerpt_az,
      content: content ?? posts[index].content,
      content_az: content_az ?? posts[index].content_az,
      cover_image: cover_image ?? posts[index].cover_image,
      published: published ?? posts[index].published,
      sort_order: sort_order ?? posts[index].sort_order,
      updated_at: new Date().toISOString(),
    };

    res.json(posts[index]);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE post
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (supabase) {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (!error) {
        posts = posts.filter((p) => String(p.id) !== String(id));
        removeLikesForItem("posts", id);
        removeCommentsForPost(id);
        return res.json({ message: "Post deleted successfully" });
      }
      console.warn("Supabase delete post failed, using memory:", error?.message);
    }

    const before = posts.length;
    posts = posts.filter((p) => String(p.id) !== String(id));

    if (posts.length === before) {
      return res.status(404).json({ error: "Post not found" });
    }

    removeLikesForItem("posts", id);
    removeCommentsForPost(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    posts = posts.filter((p) => String(p.id) !== String(id));
    removeLikesForItem("posts", id);
    removeCommentsForPost(id);
    res.json({ message: "Post deleted successfully" });
  }
});

export default router;

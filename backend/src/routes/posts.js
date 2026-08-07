import express from "express";
import { supabase } from "../config/supabase.js";
import defaultPosts from "../data/defaultPosts.js";

const router = express.Router();

let posts = defaultPosts.map((p) => ({ ...p }));
let nextId = Math.max(0, ...posts.map((p) => p.id)) + 1;

// GET all posts
// Use ?all=true for admin (includes drafts)
router.get("/", async (req, res) => {
  const includeDrafts = req.query.all === "true";

  try {
    if (supabase) {
      let query = supabase
        .from("posts")
        .select(includeDrafts ? "*" : "id, title, slug, excerpt, cover_image, published, created_at")
        .order("created_at", { ascending: false });

      if (!includeDrafts) {
        query = query.eq("published", true);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    }

    const list = includeDrafts
      ? posts
      : posts.filter((p) => p.published);

    const postsPreview = list
      .map(({ id, title, slug, excerpt, cover_image, published, created_at }) => ({
        id,
        title,
        slug,
        excerpt,
        cover_image,
        published,
        created_at,
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(postsPreview);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
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
        return res.json(data);
      }
    }

    const post = posts.find((p) => p.slug === slug);
    if (post) return res.json(post);

    res.status(404).json({ error: "Post not found" });
  } catch (error) {
    console.error("Error fetching post:", error);
    const post = posts.find((p) => p.slug === slug);
    if (post) return res.json(post);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST create new post
router.post("/", async (req, res) => {
  const { title, slug, excerpt, content, cover_image, published } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ error: "Title, slug, and content are required" });
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("posts")
        .insert([{ title, slug, excerpt, content, cover_image, published: published || false }])
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json(data);
      }
      console.warn("Supabase create post failed, using memory:", error?.message);
    }

    const now = new Date().toISOString();
    const newPost = {
      id: nextId++,
      title,
      slug,
      excerpt: excerpt || "",
      content,
      cover_image: cover_image || null,
      published: published || false,
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
  const { title, slug, excerpt, content, cover_image, published } = req.body;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("posts")
        .update({ title, slug, excerpt, content, cover_image, published, updated_at: new Date() })
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
      slug: slug ?? posts[index].slug,
      excerpt: excerpt ?? posts[index].excerpt,
      content: content ?? posts[index].content,
      cover_image: cover_image ?? posts[index].cover_image,
      published: published ?? posts[index].published,
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
        return res.json({ message: "Post deleted successfully" });
      }
      console.warn("Supabase delete post failed, using memory:", error?.message);
    }

    const before = posts.length;
    posts = posts.filter((p) => String(p.id) !== String(id));

    if (posts.length === before) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    posts = posts.filter((p) => String(p.id) !== String(id));
    res.json({ message: "Post deleted successfully" });
  }
});

export default router;

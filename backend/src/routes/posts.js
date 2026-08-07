import express from "express";
import { supabase } from "../config/supabase.js";
import defaultPosts from "../data/defaultPosts.js";

const router = express.Router();

// GET all published posts
router.get("/", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, cover_image, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return res.json(data);
      }
    }
    
    // Return default posts (without full content)
    const postsPreview = defaultPosts
      .filter(p => p.published)
      .map(({ id, title, slug, excerpt, cover_image, created_at }) => ({
        id, title, slug, excerpt, cover_image, created_at
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
        .eq("published", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        return res.json(data);
      }
    }

    // Find in default posts
    const post = defaultPosts.find(p => p.slug === slug && p.published);
    
    if (post) {
      return res.json(post);
    }

    res.status(404).json({ error: "Post not found" });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST create new post (protected - will need auth middleware later)
router.post("/", async (req, res) => {
  const { title, slug, excerpt, content, cover_image, published } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ error: "Title, slug, and content are required" });
  }

  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([{ title, slug, excerpt, content, cover_image, published: published || false }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
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
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { data, error } = await supabase
      .from("posts")
      .update({ title, slug, excerpt, content, cover_image, published, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE post
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) throw error;

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;

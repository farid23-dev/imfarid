import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { defaultProjects } from "../data/defaultProjects.js";

const router = Router();

// Get all projects
router.get("/", async (req, res) => {
  try {
    if (!supabase) {
      return res.json(defaultProjects);
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json(defaultProjects);
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.json(defaultProjects);
  }
});

// Get featured projects (for homepage)
router.get("/featured", async (req, res) => {
  try {
    if (!supabase) {
      return res.json(defaultProjects.filter(p => p.featured));
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json(defaultProjects.filter(p => p.featured));
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res.json(defaultProjects.filter(p => p.featured));
  }
});

// Get single project by slug
router.get("/:slug", async (req, res) => {
  try {
    if (!supabase) {
      const project = defaultProjects.find(p => p.slug === req.params.slug);
      return project ? res.json(project) : res.status(404).json({ error: "Not found" });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", req.params.slug)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: "Project not found" });
  }
});

// Create project (admin only)
router.post("/", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { title, slug, description, image, live_url, featured, sort_order } = req.body;

    const { data, error } = await supabase
      .from("projects")
      .insert([{ title, slug, description, image, live_url, featured, sort_order }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project (admin only)
router.put("/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { title, slug, description, image, live_url, featured, sort_order } = req.body;

    const { data, error } = await supabase
      .from("projects")
      .update({ title, slug, description, image, live_url, featured, sort_order })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project (admin only)
router.delete("/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;

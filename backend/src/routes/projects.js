import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { defaultProjects } from "../data/defaultProjects.js";

const router = Router();

// Mutable in-memory store (starts with dummy data)
let projects = defaultProjects.map((p) => ({ ...p }));
let nextId = Math.max(0, ...projects.map((p) => p.id)) + 1;

const normalizeProject = (body, existing = {}) => ({
  title: body.title ?? existing.title ?? "",
  slug: body.slug ?? existing.slug ?? "",
  description: body.description ?? existing.description ?? "",
  image: body.cover_image || body.image || existing.image || "",
  cover_image: body.cover_image || body.image || existing.cover_image || existing.image || "",
  live_url: body.live_url ?? existing.live_url ?? "",
  github_url: body.github_url ?? existing.github_url ?? "",
  technologies: body.technologies ?? existing.technologies ?? [],
  featured: body.featured ?? existing.featured ?? false,
  sort_order: body.sort_order ?? existing.sort_order ?? 0,
});

// Get all projects
router.get("/", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    }

    res.json([...projects].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.json([...projects].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  }
});

// Get featured projects (for homepage)
router.get("/featured", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("featured", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    }

    res.json(projects.filter((p) => p.featured).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res.json(projects.filter((p) => p.featured));
  }
});

// Get single project by slug
router.get("/:slug", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", req.params.slug)
        .single();

      if (!error && data) {
        return res.json(data);
      }
    }

    const project = projects.find((p) => p.slug === req.params.slug);
    return project ? res.json(project) : res.status(404).json({ error: "Not found" });
  } catch (error) {
    const project = projects.find((p) => p.slug === req.params.slug);
    return project ? res.json(project) : res.status(404).json({ error: "Project not found" });
  }
});

// Create project
router.post("/", async (req, res) => {
  try {
    const payload = normalizeProject(req.body);

    if (!payload.title || !payload.slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .insert([{
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          image: payload.image,
          live_url: payload.live_url,
          featured: payload.featured,
          sort_order: payload.sort_order,
        }])
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json(data);
      }
      console.warn("Supabase create project failed, using memory:", error?.message);
    }

    const newProject = {
      id: nextId++,
      ...payload,
    };
    projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (supabase) {
      const payload = normalizeProject(req.body);
      const { data, error } = await supabase
        .from("projects")
        .update({
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          image: payload.image,
          live_url: payload.live_url,
          featured: payload.featured,
          sort_order: payload.sort_order,
        })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return res.json(data);
      }
      console.warn("Supabase update project failed, using memory:", error?.message);
    }

    const index = projects.findIndex((p) => String(p.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: "Project not found" });
    }

    projects[index] = {
      ...projects[index],
      ...normalizeProject(req.body, projects[index]),
      id: projects[index].id,
    };

    res.json(projects[index]);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    if (supabase) {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (!error) {
        projects = projects.filter((p) => String(p.id) !== String(id));
        return res.json({ success: true });
      }
      console.warn("Supabase delete project failed, using memory:", error?.message);
    }

    const before = projects.length;
    projects = projects.filter((p) => String(p.id) !== String(id));

    if (projects.length === before) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);

    const before = projects.length;
    projects = projects.filter((p) => String(p.id) !== String(id));
    if (projects.length < before) {
      return res.json({ success: true });
    }

    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;

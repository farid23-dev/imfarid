import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { defaultProjects } from "../data/defaultProjects.js";
import { attachLikeCounts, getLikeCount, removeLikesForItem } from "../utils/likesStore.js";
import { missingAzError } from "../utils/requireAz.js";

const router = Router();

/** In-memory fallback only when Supabase is not configured. */
let projects = defaultProjects.map((p) => ({ ...p }));
let nextId = Math.max(0, ...projects.map((p) => p.id), 0) + 1;

const sortByOrder = (list) =>
  [...list].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

const nextTopSortOrder = (list) => {
  if (!list.length) return 0;
  return Math.min(...list.map((item) => item.sort_order ?? 0)) - 1;
};

const normalizeTechnologies = (value) => {
  if (Array.isArray(value)) {
    return value.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeProject = (body, existing = {}) => {
  const resolvedCategory =
    body.category === "app" || body.category === "website"
      ? body.category
      : existing.category === "app"
        ? "app"
        : "website";

  const cover =
    body.cover_image ||
    body.image ||
    existing.cover_image ||
    existing.image ||
    "";

  return {
    title: body.title ?? existing.title ?? "",
    title_az: body.title_az ?? existing.title_az ?? "",
    slug: body.slug ?? existing.slug ?? "",
    description: body.description ?? existing.description ?? "",
    description_az: body.description_az ?? existing.description_az ?? "",
    cover_image: cover,
    image: cover,
    live_url: resolvedCategory === "website" ? (body.live_url ?? existing.live_url ?? "") : "",
    github_url: body.github_url ?? existing.github_url ?? "",
    technologies: normalizeTechnologies(
      body.technologies ?? existing.technologies ?? []
    ),
    category: resolvedCategory,
    featured: Boolean(body.featured ?? existing.featured ?? false),
    expired: Boolean(body.expired ?? existing.expired ?? false),
    sort_order: body.sort_order ?? existing.sort_order ?? 0,
    created_at: existing.created_at,
  };
};

const coerceProject = (project) => {
  const category = project.category === "app" ? "app" : "website";
  const cover = project.cover_image || project.image || "";
  return {
    ...project,
    category,
    cover_image: cover,
    image: cover,
    live_url: category === "app" ? "" : project.live_url || "",
    github_url: project.github_url || "",
    technologies: normalizeTechnologies(project.technologies),
    featured: Boolean(project.featured),
    expired: Boolean(project.expired),
  };
};

const coerceProjects = (list) => list.map(coerceProject);

const toDbRow = (payload, { includeCreatedAt = false } = {}) => {
  const row = {
    title: payload.title,
    title_az: payload.title_az || null,
    slug: payload.slug,
    description: payload.description || null,
    description_az: payload.description_az || null,
    cover_image: payload.cover_image || null,
    live_url: payload.live_url || null,
    github_url: payload.github_url || null,
    technologies: payload.technologies || [],
    category: payload.category || "website",
    featured: Boolean(payload.featured),
    expired: Boolean(payload.expired),
    sort_order: payload.sort_order ?? 0,
  };
  if (includeCreatedAt && payload.created_at) {
    row.created_at = payload.created_at;
  }
  return row;
};

const resolveTopSortOrder = async () => {
  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: true })
      .limit(1);

    if (!error && data?.length) {
      return (data[0].sort_order ?? 0) - 1;
    }
    return 0;
  }
  return nextTopSortOrder(projects);
};

const applyOrder = async (ids) => {
  if (supabase) {
    const results = await Promise.all(
      ids.map((id, index) =>
        supabase.from("projects").update({ sort_order: index }).eq("id", id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      throw new Error(failed.error.message || "Failed to reorder projects");
    }
    return;
  }

  ids.forEach((id, index) => {
    const item = projects.find((p) => String(p.id) === String(id));
    if (item) item.sort_order = index;
  });
  projects = sortByOrder(projects);
};

// Get all projects
router.get("/", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Supabase fetch projects failed:", error.message);
        return res.status(500).json({ error: "Failed to fetch projects from database" });
      }

      return res.json(await attachLikeCounts("projects", coerceProjects(data || [])));
    }

    res.json(await attachLikeCounts("projects", coerceProjects(sortByOrder(projects))));
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
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

      if (error) {
        console.error("Supabase fetch featured projects failed:", error.message);
        return res.status(500).json({ error: "Failed to fetch featured projects" });
      }

      return res.json(await attachLikeCounts("projects", coerceProjects(data || [])));
    }

    res.json(
      await attachLikeCounts(
        "projects",
        coerceProjects(sortByOrder(projects.filter((p) => p.featured)))
      )
    );
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res.status(500).json({ error: "Failed to fetch featured projects" });
  }
});

// Reorder projects (must be before /:slug and /:id)
router.put("/reorder", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids array is required" });
  }

  try {
    await applyOrder(ids);

    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json({ success: true, items: coerceProjects(data || []) });
    }

    res.json({ success: true, items: sortByOrder(projects) });
  } catch (error) {
    console.error("Error reordering projects:", error);
    res.status(500).json({ error: error.message || "Failed to reorder projects" });
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
        .maybeSingle();

      if (error) {
        console.error("Supabase fetch project failed:", error.message);
        return res.status(500).json({ error: "Failed to fetch project" });
      }

      if (!data) {
        return res.status(404).json({ error: "Not found" });
      }

      return res.json({
        ...coerceProject(data),
        like_count: await getLikeCount("projects", data.id),
      });
    }

    const project = projects.find((p) => p.slug === req.params.slug);
    return project
      ? res.json({
          ...coerceProject(project),
          like_count: await getLikeCount("projects", project.id),
        })
      : res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Create project
router.post("/", async (req, res) => {
  try {
    const payload = normalizeProject(req.body);
    const now = new Date().toISOString();

    if (!payload.title || !payload.slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const azError = missingAzError({
      "Title (AZ)": payload.title_az,
      ...(String(payload.description || "").trim()
        ? { "Description (AZ)": payload.description_az }
        : {}),
    });
    if (azError) {
      return res.status(400).json({ error: azError });
    }

    payload.sort_order = req.body.sort_order ?? (await resolveTopSortOrder());
    payload.created_at = now;

    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .insert([toDbRow(payload, { includeCreatedAt: true })])
        .select()
        .single();

      if (error || !data) {
        console.error("Supabase create project failed:", error?.message);
        return res.status(500).json({
          error: error?.message || "Failed to save project to database",
        });
      }

      return res.status(201).json(coerceProject(data));
    }

    const newProject = {
      id: nextId++,
      ...payload,
    };
    projects.unshift(newProject);
    res.status(201).json(coerceProject(newProject));
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const payload = normalizeProject(req.body);

    if (!payload.title || !payload.slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const azError = missingAzError({
      "Title (AZ)": payload.title_az,
      ...(String(payload.description || "").trim()
        ? { "Description (AZ)": payload.description_az }
        : {}),
    });
    if (azError) {
      return res.status(400).json({ error: azError });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .update(toDbRow(payload))
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase update project failed:", error.message);
        return res.status(500).json({ error: error.message });
      }
      if (!data) {
        return res.status(404).json({ error: "Project not found" });
      }
      return res.json(coerceProject(data));
    }

    const index = projects.findIndex((p) => String(p.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: "Project not found" });
    }

    projects[index] = {
      ...projects[index],
      ...payload,
      id: projects[index].id,
    };

    res.json(coerceProject(projects[index]));
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
      const { data, error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        console.error("Supabase delete project failed:", error.message);
        return res.status(500).json({ error: error.message });
      }
      if (!data?.length) {
        return res.status(404).json({ error: "Project not found" });
      }

      await removeLikesForItem("projects", id);
      return res.json({ success: true });
    }

    const before = projects.length;
    projects = projects.filter((p) => String(p.id) !== String(id));

    if (projects.length === before) {
      return res.status(404).json({ error: "Project not found" });
    }

    await removeLikesForItem("projects", id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;

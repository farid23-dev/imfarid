import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { defaultExperiences } from "../data/defaultExperiences.js";

const router = Router();

let experiences = defaultExperiences.map((e) => ({
  ...e,
  description: Array.isArray(e.description) ? [...e.description] : e.description,
}));
let nextId = Math.max(0, ...experiences.map((e) => e.id)) + 1;

// Get all experiences
router.get("/", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json(data);
      }
    }

    res.json([...experiences].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res.json([...experiences].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  }
});

// Get single experience
router.get("/:id", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", req.params.id)
        .single();

      if (!error && data) {
        return res.json(data);
      }
    }

    const exp = experiences.find((e) => String(e.id) === String(req.params.id));
    return exp ? res.json(exp) : res.status(404).json({ error: "Not found" });
  } catch (error) {
    const exp = experiences.find((e) => String(e.id) === String(req.params.id));
    return exp ? res.json(exp) : res.status(404).json({ error: "Experience not found" });
  }
});

// Create experience
router.post("/", async (req, res) => {
  try {
    const { company, position, location, start_date, end_date, description, sort_order } = req.body;

    if (!company || !position) {
      return res.status(400).json({ error: "Company and position are required" });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("experiences")
        .insert([{ company, position, location, start_date, end_date, description, sort_order }])
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json(data);
      }
      console.warn("Supabase create experience failed, using memory:", error?.message);
    }

    const newExp = {
      id: nextId++,
      company,
      position,
      location: location || "",
      start_date: start_date || "",
      end_date: end_date || "",
      description: description || [],
      sort_order: sort_order ?? nextId,
    };
    experiences.push(newExp);
    res.status(201).json(newExp);
  } catch (error) {
    console.error("Error creating experience:", error);
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// Update experience
router.put("/:id", async (req, res) => {
  try {
    const { company, position, location, start_date, end_date, description, sort_order } = req.body;
    const id = req.params.id;

    if (supabase) {
      const { data, error } = await supabase
        .from("experiences")
        .update({ company, position, location, start_date, end_date, description, sort_order })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return res.json(data);
      }
      console.warn("Supabase update experience failed, using memory:", error?.message);
    }

    const index = experiences.findIndex((e) => String(e.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: "Experience not found" });
    }

    experiences[index] = {
      ...experiences[index],
      company: company ?? experiences[index].company,
      position: position ?? experiences[index].position,
      location: location ?? experiences[index].location,
      start_date: start_date ?? experiences[index].start_date,
      end_date: end_date ?? experiences[index].end_date,
      description: description ?? experiences[index].description,
      sort_order: sort_order ?? experiences[index].sort_order,
    };

    res.json(experiences[index]);
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ error: "Failed to update experience" });
  }
});

// Delete experience
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (supabase) {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", id);

      if (!error) {
        experiences = experiences.filter((e) => String(e.id) !== String(id));
        return res.json({ success: true });
      }
      console.warn("Supabase delete experience failed, using memory:", error?.message);
    }

    const before = experiences.length;
    experiences = experiences.filter((e) => String(e.id) !== String(id));

    if (experiences.length === before) {
      return res.status(404).json({ error: "Experience not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting experience:", error);
    experiences = experiences.filter((e) => String(e.id) !== String(req.params.id));
    res.json({ success: true });
  }
});

export default router;

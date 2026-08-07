import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { defaultExperiences } from "../data/defaultExperiences.js";

const router = Router();

// Get all experiences
router.get("/", async (req, res) => {
  try {
    if (!supabase) {
      return res.json(defaultExperiences);
    }

    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // If no data in DB, return defaults
    if (!data || data.length === 0) {
      return res.json(defaultExperiences);
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res.json(defaultExperiences);
  }
});

// Get single experience
router.get("/:id", async (req, res) => {
  try {
    if (!supabase) {
      const exp = defaultExperiences.find(e => e.id === parseInt(req.params.id));
      return exp ? res.json(exp) : res.status(404).json({ error: "Not found" });
    }

    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: "Experience not found" });
  }
});

// Create experience (admin only)
router.post("/", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { company, position, location, start_date, end_date, description, sort_order } = req.body;

    const { data, error } = await supabase
      .from("experiences")
      .insert([{ company, position, location, start_date, end_date, description, sort_order }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating experience:", error);
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// Update experience (admin only)
router.put("/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { company, position, location, start_date, end_date, description, sort_order } = req.body;

    const { data, error } = await supabase
      .from("experiences")
      .update({ company, position, location, start_date, end_date, description, sort_order })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ error: "Failed to update experience" });
  }
});

// Delete experience (admin only)
router.delete("/:id", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: "Database not configured" });
    }

    const { error } = await supabase
      .from("experiences")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ error: "Failed to delete experience" });
  }
});

export default router;

import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { defaultExperiences } from "../data/defaultExperiences.js";
import { missingAzError } from "../utils/requireAz.js";

const router = Router();

let experiences = defaultExperiences.map((e) => ({
  ...e,
  description: Array.isArray(e.description) ? [...e.description] : e.description,
}));
let nextId = Math.max(0, ...experiences.map((e) => e.id)) + 1;

const sortByOrder = (list) =>
  [...list].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

const nextTopSortOrder = (list) => {
  if (!list.length) return 0;
  return Math.min(...list.map((item) => item.sort_order ?? 0)) - 1;
};

const applyOrder = async (ids) => {
  ids.forEach((id, index) => {
    const item = experiences.find((e) => String(e.id) === String(id));
    if (item) item.sort_order = index;
  });
  experiences = sortByOrder(experiences);

  if (supabase) {
    await Promise.all(
      ids.map((id, index) =>
        supabase.from("experiences").update({ sort_order: index }).eq("id", id)
      )
    );
  }
};

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

    res.json(sortByOrder(experiences));
  } catch (error) {
    console.error("Error fetching experiences:", error);
    res.json(sortByOrder(experiences));
  }
});

// Reorder experiences
router.put("/reorder", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids array is required" });
  }

  try {
    await applyOrder(ids);
    res.json({ success: true, items: sortByOrder(experiences) });
  } catch (error) {
    console.error("Error reordering experiences:", error);
    res.status(500).json({ error: "Failed to reorder experiences" });
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
    const {
      company,
      position,
      position_az,
      location,
      location_az,
      start_date,
      start_date_az,
      end_date,
      end_date_az,
      description,
      description_az,
      sort_order,
    } = req.body;
    const now = new Date().toISOString();
    const topSort = sort_order ?? nextTopSortOrder(experiences);

    if (!company || !position) {
      return res.status(400).json({ error: "Company and position are required" });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const azError = missingAzError({
      "Position (AZ)": position_az,
      "Start Date (AZ)": start_date_az,
      "End Date (AZ)": end_date_az,
      ...(String(location || "").trim() ? { "Location (AZ)": location_az } : {}),
      ...((Array.isArray(description) ? description.length : String(description || "").trim())
        ? { "Description (AZ)": description_az }
        : {}),
    });
    if (azError) {
      return res.status(400).json({ error: azError });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("experiences")
        .insert([{
          company,
          position,
          position_az: position_az || null,
          location,
          location_az: location_az || null,
          start_date,
          start_date_az: start_date_az || null,
          end_date,
          end_date_az: end_date_az || null,
          description,
          description_az: description_az || null,
          sort_order: topSort,
          created_at: now,
        }])
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
      position_az: position_az || "",
      location: location || "",
      location_az: location_az || "",
      start_date: start_date || "",
      start_date_az: start_date_az || "",
      end_date: end_date || "",
      end_date_az: end_date_az || "",
      description: description || [],
      description_az: description_az || [],
      sort_order: topSort,
      created_at: now,
    };
    experiences.unshift(newExp);
    res.status(201).json(newExp);
  } catch (error) {
    console.error("Error creating experience:", error);
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// Update experience
router.put("/:id", async (req, res) => {
  try {
    const {
      company,
      position,
      position_az,
      location,
      location_az,
      start_date,
      start_date_az,
      end_date,
      end_date_az,
      description,
      description_az,
      sort_order,
    } = req.body;
    const id = req.params.id;

    if (!company || !position) {
      return res.status(400).json({ error: "Company and position are required" });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const azError = missingAzError({
      "Position (AZ)": position_az,
      "Start Date (AZ)": start_date_az,
      "End Date (AZ)": end_date_az,
      ...(String(location || "").trim() ? { "Location (AZ)": location_az } : {}),
      ...((Array.isArray(description) ? description.length : String(description || "").trim())
        ? { "Description (AZ)": description_az }
        : {}),
    });
    if (azError) {
      return res.status(400).json({ error: azError });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("experiences")
        .update({
          company,
          position,
          position_az,
          location,
          location_az,
          start_date,
          start_date_az,
          end_date,
          end_date_az,
          description,
          description_az,
          sort_order,
        })
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
      position_az: position_az ?? experiences[index].position_az,
      location: location ?? experiences[index].location,
      location_az: location_az ?? experiences[index].location_az,
      start_date: start_date ?? experiences[index].start_date,
      start_date_az: start_date_az ?? experiences[index].start_date_az,
      end_date: end_date ?? experiences[index].end_date,
      end_date_az: end_date_az ?? experiences[index].end_date_az,
      description: description ?? experiences[index].description,
      description_az: description_az ?? experiences[index].description_az,
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

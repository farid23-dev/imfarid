import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// In-memory storage for when Supabase is not configured
let messages = [];

// POST - Submit contact form
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: "Name, email, and message are required" 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: "Please provide a valid email address" 
    });
  }

  const newMessage = {
    name,
    email,
    subject: subject || "No Subject",
    message,
    read: false,
    created_at: new Date().toISOString(),
  };

  try {
    if (supabase) {
      // Save to Supabase
      const { data, error } = await supabase
        .from("contact_messages")
        .insert([newMessage])
        .select()
        .single();

      if (error) throw error;

      console.log(`New contact message from ${name} (${email})`);
      
      return res.status(201).json({ 
        success: true, 
        message: "Thank you for your message! I'll get back to you soon.",
        id: data.id 
      });
    }

    // Fallback: store in memory
    newMessage.id = Date.now();
    messages.push(newMessage);
    
    console.log(`New contact message from ${name} (${email}) - stored in memory`);
    
    res.status(201).json({ 
      success: true, 
      message: "Thank you for your message! I'll get back to you soon.",
      id: newMessage.id 
    });

  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ 
      error: "Failed to send message. Please try again or email me directly." 
    });
  }
});

// GET - Get all messages (protected - for admin)
router.get("/", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.json(data);
    }

    // Return in-memory messages
    res.json(messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// PUT - Mark message as read
router.put("/:id/read", async (req, res) => {
  const { id } = req.params;

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("contact_messages")
        .update({ read: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // Update in-memory
    const msg = messages.find(m => m.id === parseInt(id));
    if (msg) {
      msg.read = true;
      return res.json(msg);
    }
    
    res.status(404).json({ error: "Message not found" });

  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// DELETE - Delete message
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (supabase) {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return res.json({ message: "Message deleted successfully" });
    }

    // Delete from memory
    messages = messages.filter(m => m.id !== parseInt(id));
    res.json({ message: "Message deleted successfully" });

  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;

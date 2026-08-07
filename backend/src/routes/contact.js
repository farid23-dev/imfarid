import express from "express";
import { Resend } from "resend";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// In-memory storage for when Supabase is not configured
let messages = [];

// Initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Send email notification
const sendEmailNotification = async (contactData) => {
  if (!resend) {
    console.log("Email not configured (no RESEND_API_KEY) - skipping notification");
    return false;
  }

  const { name, email, subject, message } = contactData;
  const recipientEmail = process.env.CONTACT_EMAIL || "ismayilovf@outlook.com";

  try {
    await resend.emails.send({
      from: "Imfarid.com <onboarding@resend.dev>",
      replyTo: email,
      to: recipientEmail,
      subject: `[Imfarid.com Contact] ${subject || "New Message"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2ef2c8; border-bottom: 2px solid #2ef2c8; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject || "No Subject"}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">This message was sent from your website contact form at imfarid.com</p>
        </div>
      `,
    });

    console.log(`Email notification sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error.message);
    return false;
  }
};

// POST - Submit contact form
router.post("/", async (req, res) => {
  console.log("=== Contact form submission received ===");
  console.log("Body:", req.body);
  console.log("Resend configured:", !!resend);
  
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
      // Try to save to Supabase
      const { data, error } = await supabase
        .from("contact_messages")
        .insert([newMessage])
        .select()
        .single();

      if (!error && data) {
        console.log(`New contact message from ${name} (${email}) - saved to Supabase`);
        
        // Send email notification
        await sendEmailNotification({ name, email, subject, message });
        
        return res.status(201).json({ 
          success: true, 
          message: "Thank you for your message! I'll get back to you soon.",
          id: data.id 
        });
      }
      
      // If Supabase failed (table doesn't exist, etc.), fall back to memory
      console.warn("Supabase insert failed, falling back to memory:", error?.message);
    }

    // Fallback: store in memory
    newMessage.id = Date.now();
    messages.push(newMessage);
    
    console.log(`New contact message from ${name} (${email}) - stored in memory`);

    // Send email notification
    await sendEmailNotification({ name, email, subject, message });
    
    res.status(201).json({ 
      success: true, 
      message: "Thank you for your message! I'll get back to you soon.",
      id: newMessage.id 
    });

  } catch (error) {
    console.error("Error saving contact message:", error);
    
    // Last resort: try memory storage
    try {
      newMessage.id = Date.now();
      messages.push(newMessage);
      console.log(`New contact message from ${name} (${email}) - stored in memory (after error)`);
      
      return res.status(201).json({ 
        success: true, 
        message: "Thank you for your message! I'll get back to you soon.",
        id: newMessage.id 
      });
    } catch (memError) {
      res.status(500).json({ 
        error: "Failed to send message. Please try again or email me directly." 
      });
    }
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

      if (!error && data) {
        return res.json(data);
      }
      
      // If Supabase fails, fall back to in-memory
      console.warn("Supabase fetch failed, returning in-memory messages:", error?.message);
    }

    // Return in-memory messages
    res.json(messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

  } catch (error) {
    console.error("Error fetching messages:", error);
    // Still return in-memory as fallback
    res.json(messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
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

      if (!error && data) {
        return res.json(data);
      }
      console.warn("Supabase mark read failed, trying memory:", error?.message);
    }

    // Update in-memory
    const msg = messages.find((m) => String(m.id) === String(id));
    if (msg) {
      msg.read = true;
      return res.json(msg);
    }

    res.status(404).json({ error: "Message not found" });
  } catch (error) {
    console.error("Error updating message:", error);

    const msg = messages.find((m) => String(m.id) === String(id));
    if (msg) {
      msg.read = true;
      return res.json(msg);
    }

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

      if (!error) {
        return res.json({ message: "Message deleted successfully" });
      }
      console.warn("Supabase delete failed, trying memory:", error?.message);
    }

    // Delete from memory
    messages = messages.filter((m) => String(m.id) !== String(id));
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    messages = messages.filter((m) => String(m.id) !== String(id));
    res.json({ message: "Message deleted successfully" });
  }
});

export default router;

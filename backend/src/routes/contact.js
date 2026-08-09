import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import { supabase } from "../config/supabase.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesFile = path.join(__dirname, "../data/contact-messages.json");

/** Local JSON is only used when Supabase is not configured. */
const loadMessages = () => {
  try {
    if (fs.existsSync(messagesFile)) {
      return JSON.parse(fs.readFileSync(messagesFile, "utf8"));
    }
  } catch (error) {
    console.warn("Failed to load contact messages file:", error.message);
  }
  return [];
};

const saveMessages = (list) => {
  try {
    fs.writeFileSync(messagesFile, JSON.stringify(list, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save contact messages file:", error.message);
  }
};

let messages = loadMessages();

const sortedMessages = () =>
  [...messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const formatSupabaseError = (error) =>
  [error?.message, error?.details, error?.hint, error?.code].filter(Boolean).join(" | ") ||
  "Unknown Supabase error";

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

const saveLocalMessage = (newMessage) => {
  newMessage.id = newMessage.id || Date.now();
  messages.push(newMessage);
  saveMessages(messages);
  return newMessage;
};

// POST - Submit contact form
router.post("/", async (req, res) => {
  const { name, email, subject, message, captchaToken } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Name, email, and message are required",
    });
  }

  const captcha = await verifyRecaptcha(captchaToken);
  if (!captcha.ok) {
    return res.status(400).json({ error: captcha.error });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Please provide a valid email address",
    });
  }

  const row = {
    name: String(name).trim(),
    email: String(email).trim(),
    subject: String(subject || "No Subject").trim() || "No Subject",
    message: String(message).trim(),
    read: false,
  };

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("contact_messages")
        .insert([row])
        .select()
        .single();

      if (error || !data) {
        console.error("Supabase contact insert failed:", formatSupabaseError(error));
        // Still try email so you don't miss the lead
        await sendEmailNotification(row);
        return res.status(500).json({
          error:
            "Could not save your message to the database. Please try again or email me directly.",
          detail: formatSupabaseError(error),
        });
      }

      console.log(`New contact message from ${row.name} (${row.email}) - saved to Supabase #${data.id}`);
      await sendEmailNotification(row);

      return res.status(201).json({
        success: true,
        message: "Thank you for your message! I'll get back to you soon.",
        id: data.id,
      });
    }

    const saved = saveLocalMessage({
      ...row,
      created_at: new Date().toISOString(),
    });
    console.log(`New contact message from ${row.name} (${row.email}) - stored in local file (no Supabase)`);
    await sendEmailNotification(row);

    res.status(201).json({
      success: true,
      message: "Thank you for your message! I'll get back to you soon.",
      id: saved.id,
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    await sendEmailNotification(row);
    res.status(500).json({
      error: "Failed to send message. Please try again or email me directly.",
    });
  }
});

// GET - Get all messages (for admin)
router.get("/", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch contact messages failed:", formatSupabaseError(error));
        return res.status(500).json({ error: "Failed to fetch messages from database" });
      }

      // Include any legacy local-only rows that never made it into Supabase
      const remote = data || [];
      const remoteIds = new Set(remote.map((m) => String(m.id)));
      const legacy = sortedMessages().filter((m) => !remoteIds.has(String(m.id)));
      return res.json([...remote, ...legacy]);
    }

    res.json(sortedMessages());
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
        .maybeSingle();

      if (error) {
        console.error("Supabase mark read failed:", formatSupabaseError(error));
        return res.status(500).json({ error: formatSupabaseError(error) });
      }
      if (data) {
        return res.json(data);
      }
      // Fall through for legacy local-only ids
    }

    const msg = messages.find((m) => String(m.id) === String(id));
    if (msg) {
      msg.read = true;
      saveMessages(messages);
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
      const { data, error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        console.error("Supabase delete failed:", formatSupabaseError(error));
        return res.status(500).json({ error: formatSupabaseError(error) });
      }

      if (data?.length) {
        messages = messages.filter((m) => String(m.id) !== String(id));
        saveMessages(messages);
        return res.json({ message: "Message deleted successfully" });
      }
      // Fall through for legacy local-only ids
    }

    const before = messages.length;
    messages = messages.filter((m) => String(m.id) !== String(id));
    if (messages.length === before) {
      return res.status(404).json({ error: "Message not found" });
    }
    saveMessages(messages);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;

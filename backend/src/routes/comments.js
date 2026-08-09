import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  clearCommentReply,
  createComment,
  deleteComment,
  getAllComments,
  getCommentsForPost,
  getCommentsSummary,
  markCommentRead,
  replyToComment,
} from "../utils/commentsStore.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";

const router = Router();

const MAX_NAME = 80;
const MAX_MESSAGE = 2000;
const MAX_REPLY = 2000;

// Public: comments for a post
router.get("/post/:postId", async (req, res) => {
  try {
    const list = (await getCommentsForPost(req.params.postId)).map((c) => ({
      id: c.id,
      name: c.name,
      message: c.message,
      reply: c.reply,
      replied_at: c.replied_at,
      created_at: c.created_at,
    }));
    res.json(list);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Public: submit a comment
router.post("/", async (req, res) => {
  try {
    const { post_id, post_slug, post_title, name, message, captchaToken } = req.body || {};

    if (!post_id || !name?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Name and comment are required" });
    }

    const captcha = await verifyRecaptcha(captchaToken);
    if (!captcha.ok) {
      return res.status(400).json({ error: captcha.error });
    }

    if (String(name).trim().length > MAX_NAME) {
      return res.status(400).json({ error: `Name must be ${MAX_NAME} characters or fewer` });
    }

    if (String(message).trim().length > MAX_MESSAGE) {
      return res.status(400).json({ error: `Comment must be ${MAX_MESSAGE} characters or fewer` });
    }

    const comment = await createComment({
      post_id,
      post_slug,
      post_title,
      name,
      message,
    });

    res.status(201).json({
      id: comment.id,
      name: comment.name,
      message: comment.message,
      reply: comment.reply,
      replied_at: comment.replied_at,
      created_at: comment.created_at,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Admin: list all comments
router.get("/", authMiddleware, async (req, res) => {
  try {
    res.json(await getAllComments());
  } catch (error) {
    console.error("Error listing comments:", error);
    res.status(500).json({ error: "Failed to list comments" });
  }
});

// Admin: summary counts
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    res.json(await getCommentsSummary());
  } catch (error) {
    console.error("Error fetching comments summary:", error);
    res.status(500).json({ error: "Failed to fetch comments summary" });
  }
});

// Admin: mark read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const comment = await markCommentRead(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  } catch (error) {
    console.error("Error marking comment read:", error);
    res.status(500).json({ error: "Failed to mark comment read" });
  }
});

// Admin: reply
router.put("/:id/reply", authMiddleware, async (req, res) => {
  try {
    const { reply } = req.body || {};

    if (!reply?.trim()) {
      return res.status(400).json({ error: "Reply text is required" });
    }

    if (String(reply).trim().length > MAX_REPLY) {
      return res.status(400).json({ error: `Reply must be ${MAX_REPLY} characters or fewer` });
    }

    const comment = await replyToComment(req.params.id, reply);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ error: "Failed to reply to comment" });
  }
});

// Admin: clear reply
router.delete("/:id/reply", authMiddleware, async (req, res) => {
  try {
    const comment = await clearCommentReply(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
  } catch (error) {
    console.error("Error clearing comment reply:", error);
    res.status(500).json({ error: "Failed to clear comment reply" });
  }
});

// Admin: delete comment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const ok = await deleteComment(req.params.id);
    if (!ok) return res.status(404).json({ error: "Comment not found" });
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;

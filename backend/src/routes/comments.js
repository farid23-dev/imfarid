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

const router = Router();

const MAX_NAME = 80;
const MAX_MESSAGE = 2000;
const MAX_REPLY = 2000;

// Public: comments for a post
router.get("/post/:postId", (req, res) => {
  const list = getCommentsForPost(req.params.postId).map((c) => ({
    id: c.id,
    name: c.name,
    message: c.message,
    reply: c.reply,
    replied_at: c.replied_at,
    created_at: c.created_at,
  }));
  res.json(list);
});

// Public: submit a comment
router.post("/", (req, res) => {
  const { post_id, post_slug, post_title, name, message } = req.body || {};

  if (!post_id || !name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name and comment are required" });
  }

  if (String(name).trim().length > MAX_NAME) {
    return res.status(400).json({ error: `Name must be ${MAX_NAME} characters or fewer` });
  }

  if (String(message).trim().length > MAX_MESSAGE) {
    return res.status(400).json({ error: `Comment must be ${MAX_MESSAGE} characters or fewer` });
  }

  const comment = createComment({
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
});

// Admin: list all comments
router.get("/", authMiddleware, (req, res) => {
  res.json(getAllComments());
});

// Admin: summary counts
router.get("/summary", authMiddleware, (req, res) => {
  res.json(getCommentsSummary());
});

// Admin: mark read
router.put("/:id/read", authMiddleware, (req, res) => {
  const comment = markCommentRead(req.params.id);
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  res.json(comment);
});

// Admin: reply
router.put("/:id/reply", authMiddleware, (req, res) => {
  const { reply } = req.body || {};

  if (!reply?.trim()) {
    return res.status(400).json({ error: "Reply text is required" });
  }

  if (String(reply).trim().length > MAX_REPLY) {
    return res.status(400).json({ error: `Reply must be ${MAX_REPLY} characters or fewer` });
  }

  const comment = replyToComment(req.params.id, reply);
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  res.json(comment);
});

// Admin: clear reply
router.delete("/:id/reply", authMiddleware, (req, res) => {
  const comment = clearCommentReply(req.params.id);
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  res.json(comment);
});

// Admin: delete comment
router.delete("/:id", authMiddleware, (req, res) => {
  const ok = deleteComment(req.params.id);
  if (!ok) return res.status(404).json({ error: "Comment not found" });
  res.json({ message: "Comment deleted successfully" });
});

export default router;

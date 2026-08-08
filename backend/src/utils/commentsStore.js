import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commentsFile = path.join(__dirname, "../data/blog-comments.json");

const loadComments = () => {
  try {
    if (fs.existsSync(commentsFile)) {
      return JSON.parse(fs.readFileSync(commentsFile, "utf8"));
    }
  } catch (error) {
    console.warn("Failed to load blog comments file:", error.message);
  }
  return [];
};

const saveComments = (list) => {
  try {
    fs.writeFileSync(commentsFile, JSON.stringify(list, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save blog comments file:", error.message);
  }
};

let comments = loadComments();
let nextId = Math.max(0, ...comments.map((c) => Number(c.id) || 0)) + 1;

const persist = () => saveComments(comments);

export const getAllComments = () =>
  [...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

export const getCommentsForPost = (postId) =>
  comments
    .filter((c) => String(c.post_id) === String(postId))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

export const createComment = ({ post_id, post_slug, post_title, name, message }) => {
  const comment = {
    id: nextId++,
    post_id,
    post_slug: post_slug || "",
    post_title: post_title || "",
    name: String(name).trim(),
    message: String(message).trim(),
    reply: null,
    replied_at: null,
    read: false,
    created_at: new Date().toISOString(),
  };
  comments.push(comment);
  persist();
  return comment;
};

export const findComment = (id) => comments.find((c) => String(c.id) === String(id));

export const markCommentRead = (id) => {
  const comment = findComment(id);
  if (!comment) return null;
  comment.read = true;
  persist();
  return comment;
};

export const replyToComment = (id, replyText) => {
  const comment = findComment(id);
  if (!comment) return null;
  comment.reply = String(replyText).trim();
  comment.replied_at = new Date().toISOString();
  comment.read = true;
  persist();
  return comment;
};

export const clearCommentReply = (id) => {
  const comment = findComment(id);
  if (!comment) return null;
  comment.reply = null;
  comment.replied_at = null;
  persist();
  return comment;
};

export const deleteComment = (id) => {
  const before = comments.length;
  comments = comments.filter((c) => String(c.id) !== String(id));
  if (comments.length === before) return false;
  persist();
  return true;
};

export const removeCommentsForPost = (postId) => {
  const before = comments.length;
  comments = comments.filter((c) => String(c.post_id) !== String(postId));
  if (comments.length !== before) persist();
};

export const getCommentCount = (postId) =>
  comments.filter((c) => String(c.post_id) === String(postId)).length;

export const attachCommentCounts = (items = []) =>
  items.map((item) => ({
    ...item,
    comment_count: getCommentCount(item.id),
  }));

export const getCommentsSummary = () => {
  const all = getAllComments();
  return {
    total: all.length,
    unread: all.filter((c) => !c.read).length,
    unreplied: all.filter((c) => !c.reply).length,
  };
};

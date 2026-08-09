import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "../config/supabase.js";

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

const useSupabase = () => Boolean(supabase);

const mapRow = (row) => ({
  id: row.id,
  post_id: row.post_id,
  post_slug: row.post_slug || "",
  post_title: row.post_title || "",
  name: row.name,
  message: row.message,
  reply: row.reply ?? null,
  replied_at: row.replied_at ?? null,
  read: Boolean(row.read),
  created_at: row.created_at,
});

export const getAllComments = async () => {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map(mapRow);
    }
    console.warn("Supabase getAllComments failed, using file store:", error?.message);
  }

  return [...comments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getCommentsForPost = async (postId) => {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", String(postId))
      .order("created_at", { ascending: true });

    if (!error && data) {
      return data.map(mapRow);
    }
    console.warn("Supabase getCommentsForPost failed, using file store:", error?.message);
  }

  return comments
    .filter((c) => String(c.post_id) === String(postId))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
};

export const createComment = async ({ post_id, post_slug, post_title, name, message }) => {
  const payload = {
    post_id: String(post_id),
    post_slug: post_slug || "",
    post_title: post_title || "",
    name: String(name).trim(),
    message: String(message).trim(),
    reply: null,
    replied_at: null,
    read: false,
  };

  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .insert([{ ...payload, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (!error && data) {
      return mapRow(data);
    }
    console.warn("Supabase createComment failed, using file store:", error?.message);
  }

  const comment = {
    id: nextId++,
    ...payload,
    created_at: new Date().toISOString(),
  };
  comments.push(comment);
  persist();
  return comment;
};

export const findComment = async (id) => {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return mapRow(data);
    }
    if (error) {
      console.warn("Supabase findComment failed, using file store:", error.message);
    }
  }

  return comments.find((c) => String(c.id) === String(id)) || null;
};

export const markCommentRead = async (id) => {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .update({ read: true })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!error && data) {
      return mapRow(data);
    }
    if (error) {
      console.warn("Supabase markCommentRead failed, using file store:", error.message);
    }
  }

  const comment = comments.find((c) => String(c.id) === String(id));
  if (!comment) return null;
  comment.read = true;
  persist();
  return comment;
};

export const replyToComment = async (id, replyText) => {
  const reply = String(replyText).trim();
  const replied_at = new Date().toISOString();

  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .update({ reply, replied_at, read: true })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!error && data) {
      return mapRow(data);
    }
    if (error) {
      console.warn("Supabase replyToComment failed, using file store:", error.message);
    }
  }

  const comment = comments.find((c) => String(c.id) === String(id));
  if (!comment) return null;
  comment.reply = reply;
  comment.replied_at = replied_at;
  comment.read = true;
  persist();
  return comment;
};

export const clearCommentReply = async (id) => {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .update({ reply: null, replied_at: null })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!error && data) {
      return mapRow(data);
    }
    if (error) {
      console.warn("Supabase clearCommentReply failed, using file store:", error.message);
    }
  }

  const comment = comments.find((c) => String(c.id) === String(id));
  if (!comment) return null;
  comment.reply = null;
  comment.replied_at = null;
  persist();
  return comment;
};

export const deleteComment = async (id) => {
  if (useSupabase()) {
    const { data, error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("id", id)
      .select("id");

    if (!error) {
      return (data?.length || 0) > 0;
    }
    console.warn("Supabase deleteComment failed, using file store:", error.message);
  }

  const before = comments.length;
  comments = comments.filter((c) => String(c.id) !== String(id));
  if (comments.length === before) return false;
  persist();
  return true;
};

export const removeCommentsForPost = async (postId) => {
  if (useSupabase()) {
    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("post_id", String(postId));

    if (!error) return;
    console.warn("Supabase removeCommentsForPost failed, using file store:", error.message);
  }

  const before = comments.length;
  comments = comments.filter((c) => String(c.post_id) !== String(postId));
  if (comments.length !== before) persist();
};

export const getCommentCount = async (postId) => {
  if (useSupabase()) {
    const { count, error } = await supabase
      .from("blog_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", String(postId));

    if (!error) return count || 0;
    console.warn("Supabase getCommentCount failed, using file store:", error.message);
  }

  return comments.filter((c) => String(c.post_id) === String(postId)).length;
};

export const attachCommentCounts = async (items = []) => {
  if (!items.length) return items;

  if (useSupabase()) {
    const ids = items.map((item) => String(item.id));
    const { data, error } = await supabase
      .from("blog_comments")
      .select("post_id")
      .in("post_id", ids);

    if (!error) {
      const counts = {};
      for (const row of data || []) {
        const key = String(row.post_id);
        counts[key] = (counts[key] || 0) + 1;
      }
      return items.map((item) => ({
        ...item,
        comment_count: counts[String(item.id)] || 0,
      }));
    }
    console.warn("Supabase attachCommentCounts failed, using file store:", error.message);
  }

  return items.map((item) => ({
    ...item,
    comment_count: comments.filter((c) => String(c.post_id) === String(item.id)).length,
  }));
};

export const getCommentsSummary = async () => {
  const all = await getAllComments();
  return {
    total: all.length,
    unread: all.filter((c) => !c.read).length,
    unreplied: all.filter((c) => !c.reply).length,
  };
};

import { useEffect, useState } from "react";
import {
  clearCommentReply,
  deleteComment,
  fetchComments,
  markCommentRead,
  replyToComment,
} from "../../api/admin";

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  const loadComments = async () => {
    try {
      const data = await fetchComments();
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleView = async (comment) => {
    const updated = { ...comment, read: true };
    setSelected(updated);
    setReplyText(comment.reply || "");
    setComments((prev) =>
      prev.map((c) => (String(c.id) === String(comment.id) ? updated : c))
    );

    if (!comment.read) {
      try {
        await markCommentRead(comment.id);
      } catch (error) {
        console.error("Failed to mark comment as read:", error);
      }
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;

    setSaving(true);
    try {
      const updated = await replyToComment(selected.id, replyText.trim());
      setSelected(updated);
      setComments((prev) =>
        prev.map((c) => (String(c.id) === String(updated.id) ? updated : c))
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearReply = async () => {
    if (!selected?.reply) return;
    if (!confirm("Remove your reply from this comment?")) return;

    setSaving(true);
    try {
      const updated = await clearCommentReply(selected.id);
      setSelected(updated);
      setReplyText("");
      setComments((prev) =>
        prev.map((c) => (String(c.id) === String(updated.id) ? updated : c))
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => String(c.id) !== String(id)));
      if (selected && String(selected.id) === String(id)) {
        setSelected(null);
        setReplyText("");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="admin-page__loading">Loading...</div>;

  const unreadCount = comments.filter((c) => !c.read).length;
  const unrepliedCount = comments.filter((c) => !c.reply).length;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Blog Comments</h1>
          <p>
            {comments.length} total
            {unreadCount > 0 && (
              <span className="admin-badge admin-badge--unread" style={{ marginLeft: "8px" }}>
                {unreadCount} unread
              </span>
            )}
            {unrepliedCount > 0 && (
              <span className="admin-badge admin-badge--draft" style={{ marginLeft: "8px" }}>
                {unrepliedCount} unreplied
              </span>
            )}
          </p>
        </div>
      </div>

      {selected && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>Comment</h2>
              <button
                onClick={() => {
                  setSelected(null);
                  setReplyText("");
                }}
                className="admin-modal__close"
              >
                ×
              </button>
            </div>
            <div className="admin-message-view">
              <div className="admin-message-view__meta">
                <p>
                  <strong>Post:</strong>{" "}
                  {selected.post_slug ? (
                    <a href={`/blog/${selected.post_slug}`} target="_blank" rel="noopener noreferrer">
                      {selected.post_title || selected.post_slug}
                    </a>
                  ) : (
                    selected.post_title || `#${selected.post_id}`
                  )}
                </p>
                <p className="admin-comment-from">
                  <strong>From:</strong>{" "}
                  <span className="admin-comment-from__user">
                    <img src="/avatar-default.svg" alt="" width="28" height="28" />
                    {selected.name}
                  </span>
                </p>
                <p>
                  <strong>Date:</strong> {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <div className="admin-message-view__content">
                <p>{selected.message}</p>
              </div>

              <form onSubmit={handleReply} className="admin-form admin-comment-reply">
                <div className="admin-form__field">
                  <label>Your reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows="4"
                    placeholder="Write a public reply..."
                    required
                  />
                </div>
                <div className="admin-message-view__actions">
                  <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                    {selected.reply ? "Update Reply" : "Post Reply"}
                  </button>
                  {selected.reply && (
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={handleClearReply}
                      disabled={saving}
                    >
                      Remove Reply
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(selected.id)}
                    className="admin-btn admin-btn--danger"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Post</th>
              <th>From</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-table__empty">
                  No comments yet
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id} className={!comment.read ? "is-unread" : ""}>
                  <td>
                    <span
                      className={`admin-badge ${
                        comment.reply ? "admin-badge--published" : "admin-badge--draft"
                      }`}
                    >
                      {comment.reply ? "Replied" : "Open"}
                    </span>
                    {!comment.read && (
                      <span
                        className="admin-badge admin-badge--unread"
                        style={{ marginLeft: "0.35rem" }}
                      >
                        New
                      </span>
                    )}
                  </td>
                  <td>{comment.post_title || comment.post_slug || `#${comment.post_id}`}</td>
                  <td>
                    <strong>{comment.name}</strong>
                  </td>
                  <td>
                    {comment.message.length > 80
                      ? `${comment.message.slice(0, 80)}…`
                      : comment.message}
                  </td>
                  <td>{new Date(comment.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        onClick={() => handleView(comment)}
                        className="admin-btn admin-btn--small"
                      >
                        {comment.reply ? "View / Edit" : "Reply"}
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="admin-btn admin-btn--small admin-btn--danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

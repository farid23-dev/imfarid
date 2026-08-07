import { useEffect, useState } from "react";
import { fetchAllPosts, createPost, updatePost, deletePost, reorderPosts } from "../../api/admin";
import ImageUpload from "../../components/admin/ImageUpload";
import useDragReorder, { DragHandle, ReorderActions } from "../../hooks/useDragReorder";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    published: false,
  });

  const { getRowProps, isDirty, isSaving, save, cancel } = useDragReorder(posts, setPosts, reorderPosts);

  const loadPosts = async () => {
    try {
      const data = await fetchAllPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      published: false,
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover_image: post.cover_image || "",
      published: post.published,
    });
    setEditingPost(post);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await updatePost(editingPost.id, formData);
      } else {
        await createPost(formData);
      }
      resetForm();
      loadPosts();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(id);
      loadPosts();
    } catch (error) {
      alert(error.message);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (loading) return <div className="admin-page__loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Blog Posts</h1>
          <p>Manage your blog posts · Drag rows to reorder</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowForm(true)}>
          + New Post
        </button>
      </div>

      {showForm && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{editingPost ? "Edit Post" : "New Post"}</h2>
              <button onClick={resetForm} className="admin-modal__close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: editingPost ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    required
                  />
                </div>
                <div className="admin-form__field">
                  <label>Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-form__field">
                <label>Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows="2"
                />
              </div>
              <div className="admin-form__field">
                <label>Content (HTML)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="10"
                  required
                />
              </div>
              <ImageUpload
                label="Cover Image"
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
              />
              <div className="admin-form__field admin-form__field--checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  Published
                </label>
              </div>
              <div className="admin-form__actions">
                <button type="button" onClick={resetForm} className="admin-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingPost ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReorderActions isDirty={isDirty} isSaving={isSaving} onSave={save} onCancel={cancel} />

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table__drag-col"></th>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-table__empty">No posts yet</td>
              </tr>
            ) : (
              posts.map((post, index) => (
                <tr key={post.id} {...getRowProps(index)}>
                  <td className="admin-table__drag-col"><DragHandle /></td>
                  <td><strong>{post.title}</strong></td>
                  <td><code>{post.slug}</code></td>
                  <td>
                    <span className={`admin-badge ${post.published ? "admin-badge--published" : "admin-badge--draft"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{new Date(post.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button onClick={() => handleEdit(post)} className="admin-btn admin-btn--small">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="admin-btn admin-btn--small admin-btn--danger">
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

import { useEffect, useState } from "react";
import { fetchAllPosts, createPost, updatePost, deletePost, reorderPosts } from "../../api/admin";
import AdminLangTabs from "../../components/admin/AdminLangTabs";
import ImageUpload from "../../components/admin/ImageUpload";
import useDragReorder, { DragHandle, ReorderActions } from "../../hooks/useDragReorder";
import { alertMissingAz, getMissingAzLabels } from "../../utils/requireAzFields";

const emptyForm = {
  title: "",
  title_az: "",
  slug: "",
  excerpt: "",
  excerpt_az: "",
  content: "",
  content_az: "",
  cover_image: "",
  published: false,
};

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [formData, setFormData] = useState(emptyForm);

  const { getRowProps, getHandleProps, isDirty, isSaving, save, cancel } = useDragReorder(posts, setPosts, reorderPosts);

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
    setFormData(emptyForm);
    setFormLang("en");
    setEditingPost(null);
    setShowForm(false);
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      title_az: post.title_az || "",
      slug: post.slug,
      excerpt: post.excerpt || "",
      excerpt_az: post.excerpt_az || "",
      content: post.content || "",
      content_az: post.content_az || "",
      cover_image: post.cover_image || "",
      published: post.published,
    });
    setFormLang("en");
    setEditingPost(post);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingEn = getMissingAzLabels([
      { value: formData.title, label: "Title" },
      { value: formData.slug, label: "Slug" },
      { value: formData.content, label: "Content" },
    ]);
    if (missingEn.length) {
      setFormLang("en");
      alert(`English fields are required:\n• ${missingEn.join("\n• ")}`);
      return;
    }

    const missing = getMissingAzLabels(
      [
        { value: formData.title_az, label: "Title (AZ)" },
        { value: formData.content_az, label: "Content (AZ)" },
      ],
      [{ en: formData.excerpt, az: formData.excerpt_az, label: "Excerpt (AZ)" }]
    );
    if (alertMissingAz(missing, setFormLang)) return;

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
        <button className="admin-btn admin-btn--primary" onClick={() => { setFormLang("en"); setShowForm(true); }}>
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
            <form onSubmit={handleSubmit} className="admin-form" noValidate>
              <AdminLangTabs lang={formLang} onChange={setFormLang} />
              <p className="admin-form__hint">
                Both English and Azerbaijani are required. Saving is blocked until both versions are filled.
              </p>

              <div className={`admin-form__lang-panel${formLang === "en" ? " is-active" : ""}`}>
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
              </div>

              <div className={`admin-form__lang-panel${formLang === "az" ? " is-active" : ""}`}>
                <div className="admin-form__field">
                  <label>Title (AZ)</label>
                  <input
                    type="text"
                    value={formData.title_az}
                    onChange={(e) => setFormData({ ...formData, title_az: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form__field">
                  <label>Excerpt (AZ)</label>
                  <textarea
                    value={formData.excerpt_az}
                    onChange={(e) => setFormData({ ...formData, excerpt_az: e.target.value })}
                    rows="2"
                  />
                </div>
                <div className="admin-form__field">
                  <label>Content (AZ, HTML)</label>
                  <textarea
                    value={formData.content_az}
                    onChange={(e) => setFormData({ ...formData, content_az: e.target.value })}
                    rows="10"
                    required
                  />
                </div>
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
              <th>Likes</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-table__empty">No posts yet</td>
              </tr>
            ) : (
              posts.map((post, index) => (
                <tr key={post.id} {...getRowProps(index)}>
                  <td className="admin-table__drag-col"><DragHandle {...getHandleProps(index)} /></td>
                  <td><strong>{post.title}</strong></td>
                  <td><code>{post.slug}</code></td>
                  <td>
                    <span className={`admin-badge ${post.published ? "admin-badge--published" : "admin-badge--draft"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{post.like_count ?? 0}</td>
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

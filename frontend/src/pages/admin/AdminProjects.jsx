import { useEffect, useState } from "react";
import { fetchAllProjects, createProject, updateProject, deleteProject, reorderProjects } from "../../api/admin";
import ImageUpload from "../../components/admin/ImageUpload";
import useDragReorder, { DragHandle } from "../../hooks/useDragReorder";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    cover_image: "",
    live_url: "",
    github_url: "",
    technologies: "",
    featured: false,
  });

  const { getRowProps } = useDragReorder(projects, setProjects, reorderProjects);

  const loadProjects = async () => {
    try {
      const data = await fetchAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      cover_image: "",
      live_url: "",
      github_url: "",
      technologies: "",
      featured: false,
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description || "",
      cover_image: project.cover_image || project.image || "",
      live_url: project.live_url || "",
      github_url: project.github_url || "",
      technologies: (project.technologies || []).join(", "),
      featured: project.featured,
    });
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      technologies: formData.technologies.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editingProject) {
        await updateProject(editingProject.id, submitData);
      } else {
        await createProject(submitData);
      }
      resetForm();
      loadProjects();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      loadProjects();
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
          <h1>Projects</h1>
          <p>Manage your portfolio projects · Drag rows to reorder</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowForm(true)}>
          + New Project
        </button>
      </div>

      {showForm && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{editingProject ? "Edit Project" : "New Project"}</h2>
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
                        slug: editingProject ? formData.slug : generateSlug(e.target.value),
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
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="admin-form__row">
                <ImageUpload
                  label="Cover Image"
                  value={formData.cover_image}
                  onChange={(url) => setFormData({ ...formData, cover_image: url })}
                />
                <div className="admin-form__field">
                  <label>Technologies (comma separated)</label>
                  <input
                    type="text"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    placeholder="React, Node.js, Supabase"
                  />
                </div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Live URL</label>
                  <input
                    type="text"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                  />
                </div>
                <div className="admin-form__field">
                  <label>GitHub URL</label>
                  <input
                    type="text"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-form__field admin-form__field--checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  Featured (show on homepage)
                </label>
              </div>
              <div className="admin-form__actions">
                <button type="button" onClick={resetForm} className="admin-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingProject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table__drag-col"></th>
              <th>Title</th>
              <th>Technologies</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-table__empty">No projects yet</td>
              </tr>
            ) : (
              projects.map((project, index) => (
                <tr key={project.id} {...getRowProps(index)}>
                  <td className="admin-table__drag-col"><DragHandle /></td>
                  <td>
                    <strong>{project.title}</strong>
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="admin-table__link">
                        ↗
                      </a>
                    )}
                  </td>
                  <td>
                    <div className="admin-tags">
                      {(project.technologies || []).slice(0, 3).map((tech) => (
                        <span key={tech} className="admin-tag">{tech}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${project.featured ? "admin-badge--published" : "admin-badge--draft"}`}>
                      {project.featured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button onClick={() => handleEdit(project)} className="admin-btn admin-btn--small">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="admin-btn admin-btn--small admin-btn--danger">
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

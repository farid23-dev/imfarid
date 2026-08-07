import { useEffect, useState } from "react";
import { fetchAllExperiences, createExperience, updateExperience, deleteExperience, reorderExperiences } from "../../api/admin";
import useDragReorder, { DragHandle } from "../../hooks/useDragReorder";

export default function AdminExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const { getRowProps } = useDragReorder(experiences, setExperiences, reorderExperiences);

  const loadExperiences = async () => {
    try {
      const data = await fetchAllExperiences();
      setExperiences(data);
    } catch (error) {
      console.error("Failed to load experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const resetForm = () => {
    setFormData({
      company: "",
      position: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
    });
    setEditingExperience(null);
    setShowForm(false);
  };

  const handleEdit = (exp) => {
    setFormData({
      company: exp.company,
      position: exp.position,
      location: exp.location || "",
      start_date: exp.start_date,
      end_date: exp.end_date,
      description: (exp.description || []).join("\n"),
    });
    setEditingExperience(exp);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      description: formData.description.split("\n").filter(Boolean),
    };
    try {
      if (editingExperience) {
        await updateExperience(editingExperience.id, submitData);
      } else {
        await createExperience(submitData);
      }
      resetForm();
      loadExperiences();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      await deleteExperience(id);
      loadExperiences();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="admin-page__loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Work Experiences</h1>
          <p>Manage your resume experiences · Drag rows to reorder</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowForm(true)}>
          + New Experience
        </button>
      </div>

      {showForm && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{editingExperience ? "Edit Experience" : "New Experience"}</h2>
              <button onClick={resetForm} className="admin-modal__close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form__field">
                  <label>Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Remote, On-site, Hybrid"
                  />
                </div>
              </div>
              <div className="admin-form__row">
                <div className="admin-form__field">
                  <label>Start Date</label>
                  <input
                    type="text"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    placeholder="January 2024"
                    required
                  />
                </div>
                <div className="admin-form__field">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    placeholder="Present or December 2024"
                    required
                  />
                </div>
              </div>
              <div className="admin-form__field">
                <label>Description (one bullet point per line)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="5"
                  placeholder="Developed web applications using React&#10;Managed team of 5 developers&#10;Improved performance by 40%"
                />
              </div>
              <div className="admin-form__actions">
                <button type="button" onClick={resetForm} className="admin-btn">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  {editingExperience ? "Update" : "Create"}
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
              <th>Company</th>
              <th>Position</th>
              <th>Location</th>
              <th>Period</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-table__empty">No experiences yet</td>
              </tr>
            ) : (
              experiences.map((exp, index) => (
                <tr key={exp.id} {...getRowProps(index)}>
                  <td className="admin-table__drag-col"><DragHandle /></td>
                  <td><strong>{exp.company}</strong></td>
                  <td>{exp.position}</td>
                  <td>{exp.location || "-"}</td>
                  <td>{exp.start_date} - {exp.end_date}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button onClick={() => handleEdit(exp)} className="admin-btn admin-btn--small">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="admin-btn admin-btn--small admin-btn--danger">
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

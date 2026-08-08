import { useEffect, useState } from "react";
import { fetchAllExperiences, createExperience, updateExperience, deleteExperience, reorderExperiences } from "../../api/admin";
import AdminLangTabs from "../../components/admin/AdminLangTabs";
import useDragReorder, { DragHandle, ReorderActions } from "../../hooks/useDragReorder";
import { alertMissingAz, getMissingAzLabels } from "../../utils/requireAzFields";

const emptyForm = {
  company: "",
  position: "",
  position_az: "",
  location: "",
  location_az: "",
  start_date: "",
  start_date_az: "",
  end_date: "",
  end_date_az: "",
  description: "",
  description_az: "",
};

export default function AdminExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [formLang, setFormLang] = useState("en");
  const [formData, setFormData] = useState(emptyForm);

  const { getRowProps, getHandleProps, isDirty, isSaving, save, cancel } = useDragReorder(experiences, setExperiences, reorderExperiences);

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
    setFormData(emptyForm);
    setFormLang("en");
    setEditingExperience(null);
    setShowForm(false);
  };

  const handleEdit = (exp) => {
    setFormData({
      company: exp.company,
      position: exp.position,
      position_az: exp.position_az || "",
      location: exp.location || "",
      location_az: exp.location_az || "",
      start_date: exp.start_date,
      start_date_az: exp.start_date_az || "",
      end_date: exp.end_date,
      end_date_az: exp.end_date_az || "",
      description: (exp.description || []).join("\n"),
      description_az: (exp.description_az || []).join("\n"),
    });
    setFormLang("en");
    setEditingExperience(exp);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missingEn = getMissingAzLabels([
      { value: formData.company, label: "Company" },
      { value: formData.position, label: "Position" },
      { value: formData.start_date, label: "Start Date" },
      { value: formData.end_date, label: "End Date" },
    ]);
    if (missingEn.length) {
      setFormLang("en");
      alert(`English fields are required:\n• ${missingEn.join("\n• ")}`);
      return;
    }

    const missing = getMissingAzLabels(
      [
        { value: formData.position_az, label: "Position (AZ)" },
        { value: formData.start_date_az, label: "Start Date (AZ)" },
        { value: formData.end_date_az, label: "End Date (AZ)" },
      ],
      [
        { en: formData.location, az: formData.location_az, label: "Location (AZ)" },
        { en: formData.description, az: formData.description_az, label: "Description (AZ)" },
      ]
    );
    if (alertMissingAz(missing, setFormLang)) return;

    const submitData = {
      ...formData,
      description: formData.description.split("\n").filter(Boolean),
      description_az: formData.description_az.split("\n").filter(Boolean),
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
        <button className="admin-btn admin-btn--primary" onClick={() => { setFormLang("en"); setShowForm(true); }}>
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
            <form onSubmit={handleSubmit} className="admin-form" noValidate>
              <div className="admin-form__field">
                <label>Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>

              <AdminLangTabs lang={formLang} onChange={setFormLang} />
              <p className="admin-form__hint">
                Both English and Azerbaijani are required. Saving is blocked until both versions are filled.
              </p>

              <div className={`admin-form__lang-panel${formLang === "en" ? " is-active" : ""}`}>
                <div className="admin-form__field">
                  <label>Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form__field">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Remote, On-site, Hybrid"
                  />
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
              </div>

              <div className={`admin-form__lang-panel${formLang === "az" ? " is-active" : ""}`}>
                <div className="admin-form__field">
                  <label>Position (AZ)</label>
                  <input
                    type="text"
                    value={formData.position_az}
                    onChange={(e) => setFormData({ ...formData, position_az: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form__field">
                  <label>Location (AZ)</label>
                  <input
                    type="text"
                    value={formData.location_az}
                    onChange={(e) => setFormData({ ...formData, location_az: e.target.value })}
                    placeholder="Uzaqdan, Ofisdə, Hibrid"
                  />
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label>Start Date (AZ)</label>
                    <input
                      type="text"
                      value={formData.start_date_az}
                      onChange={(e) => setFormData({ ...formData, start_date_az: e.target.value })}
                      placeholder="Yanvar 2024"
                      required
                    />
                  </div>
                  <div className="admin-form__field">
                    <label>End Date (AZ)</label>
                    <input
                      type="text"
                      value={formData.end_date_az}
                      onChange={(e) => setFormData({ ...formData, end_date_az: e.target.value })}
                      placeholder="İndiyədək və ya Dekabr 2024"
                      required
                    />
                  </div>
                </div>
                <div className="admin-form__field">
                  <label>Description (AZ, one bullet point per line)</label>
                  <textarea
                    value={formData.description_az}
                    onChange={(e) => setFormData({ ...formData, description_az: e.target.value })}
                    rows="5"
                    placeholder="React ilə veb tətbiqlər inkişaf etdirdim&#10;5 nəfərlik komanda idarə etdim"
                  />
                </div>
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

      <ReorderActions isDirty={isDirty} isSaving={isSaving} onSave={save} onCancel={cancel} />

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
                  <td className="admin-table__drag-col"><DragHandle {...getHandleProps(index)} /></td>
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

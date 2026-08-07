import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllPosts, fetchAllProjects, fetchMessages, fetchAllExperiences } from "../../api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    projects: 0,
    messages: 0,
    unreadMessages: 0,
    experiences: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [posts, projects, messages, experiences] = await Promise.all([
          fetchAllPosts().catch(() => []),
          fetchAllProjects().catch(() => []),
          fetchMessages().catch(() => []),
          fetchAllExperiences().catch(() => []),
        ]);

        setStats({
          posts: posts.length,
          projects: projects.length,
          messages: messages.length,
          unreadMessages: messages.filter((m) => !m.read).length,
          experiences: experiences.length,
        });

        setRecentMessages(messages.slice(0, 5));
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="admin-page__loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your website.</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--posts">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{stats.posts}</span>
            <span className="admin-stat__label">Blog Posts</span>
          </div>
          <Link to="/admin/posts" className="admin-stat__link">Manage →</Link>
        </div>

        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--projects">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{stats.projects}</span>
            <span className="admin-stat__label">Projects</span>
          </div>
          <Link to="/admin/projects" className="admin-stat__link">Manage →</Link>
        </div>

        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--experiences">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">{stats.experiences}</span>
            <span className="admin-stat__label">Experiences</span>
          </div>
          <Link to="/admin/experiences" className="admin-stat__link">Manage →</Link>
        </div>

        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--messages">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className="admin-stat__info">
            <span className="admin-stat__value">
              {stats.messages}
              {stats.unreadMessages > 0 && (
                <span className="admin-stat__badge">{stats.unreadMessages} new</span>
              )}
            </span>
            <span className="admin-stat__label">Messages</span>
          </div>
          <Link to="/admin/messages" className="admin-stat__link">View →</Link>
        </div>
      </div>

      {recentMessages.length > 0 && (
        <div className="admin-section">
          <div className="admin-section__header">
            <h2>Recent Messages</h2>
            <Link to="/admin/messages">View All</Link>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMessages.map((msg) => (
                  <tr key={msg.id} className={!msg.read ? "is-unread" : ""}>
                    <td>
                      <strong>{msg.name}</strong>
                      <br />
                      <small>{msg.email}</small>
                    </td>
                    <td>{msg.subject || "No Subject"}</td>
                    <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`admin-badge ${msg.read ? "admin-badge--read" : "admin-badge--unread"}`}>
                        {msg.read ? "Read" : "New"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

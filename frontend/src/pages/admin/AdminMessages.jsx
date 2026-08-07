import { useEffect, useState } from "react";
import { fetchMessages, markMessageRead, deleteMessage } from "../../api/admin";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = async () => {
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleView = async (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      try {
        await markMessageRead(message.id);
        setMessages(messages.map((m) => (m.id === message.id ? { ...m, read: true } : m)));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteMessage(id);
      setMessages(messages.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="admin-page__loading">Loading...</div>;

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Contact Messages</h1>
          <p>
            {messages.length} total messages
            {unreadCount > 0 && <span className="admin-badge admin-badge--unread" style={{ marginLeft: "8px" }}>{unreadCount} unread</span>}
          </p>
        </div>
      </div>

      {selectedMessage && (
        <div className="admin-modal">
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{selectedMessage.subject || "No Subject"}</h2>
              <button onClick={() => setSelectedMessage(null)} className="admin-modal__close">×</button>
            </div>
            <div className="admin-message-view">
              <div className="admin-message-view__meta">
                <p><strong>From:</strong> {selectedMessage.name}</p>
                <p><strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
                <p><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <div className="admin-message-view__content">
                <p>{selectedMessage.message}</p>
              </div>
              <div className="admin-message-view__actions">
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your message"}`} className="admin-btn admin-btn--primary">
                  Reply via Email
                </a>
                <button onClick={() => handleDelete(selectedMessage.id)} className="admin-btn admin-btn--danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>From</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-table__empty">No messages yet</td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message.id} className={!message.read ? "is-unread" : ""}>
                  <td>
                    <span className={`admin-badge ${message.read ? "admin-badge--read" : "admin-badge--unread"}`}>
                      {message.read ? "Read" : "New"}
                    </span>
                  </td>
                  <td>
                    <strong>{message.name}</strong>
                    <br />
                    <small>{message.email}</small>
                  </td>
                  <td>{message.subject || "No Subject"}</td>
                  <td>{new Date(message.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button onClick={() => handleView(message)} className="admin-btn admin-btn--small">
                        View
                      </button>
                      <button onClick={() => handleDelete(message.id)} className="admin-btn admin-btn--small admin-btn--danger">
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

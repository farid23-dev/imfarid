const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

// Get token from localStorage
const getToken = () => localStorage.getItem("admin_token");

// Auth headers
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Resolve image URL for display
export function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `${SERVER_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

// Upload image (optimized to WebP on server)
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to upload image");
  return data;
}

// Login
export async function login(password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);

  localStorage.setItem("admin_token", data.token);
  return data;
}

// Logout
export function logout() {
  localStorage.removeItem("admin_token");
}

// Check if logged in
export function isAuthenticated() {
  return !!getToken();
}

// Verify token
export async function verifyToken() {
  if (!getToken()) return false;

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: authHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// === POSTS ===
export async function fetchAllPosts() {
  const response = await fetch(`${API_URL}/posts?all=true`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

export async function createPost(post) {
  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(post),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function updatePost(id, post) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(post),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function deletePost(id) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete post");
  return response.json();
}

export async function reorderPosts(ids) {
  const response = await fetch(`${API_URL}/posts/reorder`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to reorder posts");
  return data;
}

// === PROJECTS ===
export async function fetchAllProjects() {
  const response = await fetch(`${API_URL}/projects`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
}

export async function createProject(project) {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(project),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function updateProject(id, project) {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(project),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function deleteProject(id) {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete project");
  return response.json();
}

export async function reorderProjects(ids) {
  const response = await fetch(`${API_URL}/projects/reorder`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to reorder projects");
  return data;
}

// === EXPERIENCES ===
export async function fetchAllExperiences() {
  const response = await fetch(`${API_URL}/experiences`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch experiences");
  return response.json();
}

export async function createExperience(experience) {
  const response = await fetch(`${API_URL}/experiences`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(experience),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function updateExperience(id, experience) {
  const response = await fetch(`${API_URL}/experiences/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(experience),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function deleteExperience(id) {
  const response = await fetch(`${API_URL}/experiences/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete experience");
  return response.json();
}

export async function reorderExperiences(ids) {
  const response = await fetch(`${API_URL}/experiences/reorder`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ ids }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to reorder experiences");
  return data;
}

// === CONTACT MESSAGES ===
export async function fetchMessages() {
  const response = await fetch(`${API_URL}/contact`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
}

export async function markMessageRead(id) {
  const response = await fetch(`${API_URL}/contact/${id}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to mark message as read");
  return response.json();
}

export async function deleteMessage(id) {
  const response = await fetch(`${API_URL}/contact/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete message");
  return response.json();
}

// === BLOG COMMENTS ===
export async function fetchComments() {
  const response = await fetch(`${API_URL}/comments`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

export async function fetchCommentsSummary() {
  const response = await fetch(`${API_URL}/comments/summary`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch comments summary");
  return response.json();
}

export async function markCommentRead(id) {
  const response = await fetch(`${API_URL}/comments/${id}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to mark comment as read");
  return response.json();
}

export async function replyToComment(id, reply) {
  const response = await fetch(`${API_URL}/comments/${id}/reply`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ reply }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to reply");
  return data;
}

export async function clearCommentReply(id) {
  const response = await fetch(`${API_URL}/comments/${id}/reply`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to remove reply");
  return data;
}

export async function deleteComment(id) {
  const response = await fetch(`${API_URL}/comments/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete comment");
  return response.json();
}

// === LIKES ===
export async function fetchLikesSummary() {
  const response = await fetch(`${API_URL}/likes/summary`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch likes summary");
  return response.json();
}

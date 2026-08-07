const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fetchOptions = {
  credentials: "include",
};

export async function fetchExperiences() {
  try {
    const response = await fetch(`${API_URL}/experiences`, fetchOptions);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return null;
  }
}

export async function fetchProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`, fetchOptions);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

export async function fetchFeaturedProjects() {
  try {
    const response = await fetch(`${API_URL}/projects/featured`, fetchOptions);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    return null;
  }
}

export async function fetchPosts() {
  try {
    const response = await fetch(`${API_URL}/posts`, fetchOptions);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
}

export async function fetchPost(slug) {
  try {
    const response = await fetch(`${API_URL}/posts/${slug}`, fetchOptions);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function fetchLike(type, id) {
  const response = await fetch(`${API_URL}/likes/${type}/${id}`, fetchOptions);
  if (!response.ok) throw new Error("Failed to fetch likes");
  return response.json();
}

export async function toggleLike(type, id) {
  const response = await fetch(`${API_URL}/likes/${type}/${id}`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to toggle like");
  return response.json();
}

export async function submitContactForm(formData) {
  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send message");
    }

    return data;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
}

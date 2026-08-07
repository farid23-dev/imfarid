const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchExperiences() {
  try {
    const response = await fetch(`${API_URL}/experiences`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return null;
  }
}

export async function fetchProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
}

export async function fetchFeaturedProjects() {
  try {
    const response = await fetch(`${API_URL}/projects/featured`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    return null;
  }
}

export async function fetchPosts() {
  try {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
}

export async function fetchPost(slug) {
  try {
    const response = await fetch(`${API_URL}/posts/${slug}`);
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

/** Shared project category helpers (frontend). */

export const PROJECT_CATEGORIES = [
  { id: "website", label: "Website" },
  { id: "app", label: "App" },
  { id: "extension", label: "Extension" },
  { id: "dashboard", label: "Dashboard" },
];

export const normalizeProjectCategory = (category) => {
  const allowed = PROJECT_CATEGORIES.map((c) => c.id);
  return allowed.includes(category) ? category : "website";
};

export const projectShowsLiveUrl = (category) =>
  normalizeProjectCategory(category) !== "app";

export const projectCategoryLabel = (category) =>
  PROJECT_CATEGORIES.find((c) => c.id === category)?.label || "Website";

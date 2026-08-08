const hasContent = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => String(item ?? "").trim().length > 0);
  }
  return String(value ?? "").trim().length > 0;
};

/** Returns an error message if any required AZ field is empty, otherwise null. */
export const missingAzError = (fields) => {
  const missing = Object.entries(fields)
    .filter(([, value]) => !hasContent(value))
    .map(([label]) => label);

  if (!missing.length) return null;
  return `Azerbaijani fields are required: ${missing.join(", ")}`;
};

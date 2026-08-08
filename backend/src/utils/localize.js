export function pickLocalized(item, field, lang = "en") {
  if (!item) return "";
  if (lang === "az") {
    const az = item[`${field}_az`];
    if (az !== undefined && az !== null && az !== "") return az;
  }
  return item[field] ?? item[`${field}_az`] ?? "";
}

export function localizeItem(item, fields, lang = "en") {
  if (!item) return item;
  const out = { ...item };
  for (const field of fields) {
    out[field] = pickLocalized(item, field, lang);
  }
  return out;
}

export function localizeList(items, fields, lang = "en") {
  return (items || []).map((item) => localizeItem(item, fields, lang));
}

export const EXPERIENCE_I18N_FIELDS = ["position", "location", "start_date", "end_date", "description"];
export const PROJECT_I18N_FIELDS = ["title", "description"];
export const POST_I18N_FIELDS = ["title", "excerpt", "content"];

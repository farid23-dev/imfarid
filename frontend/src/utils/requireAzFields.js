const hasContent = (value) => String(value ?? "").trim().length > 0;

/**
 * Returns labels of empty required AZ fields.
 * Optional EN fields: if EN has content, AZ counterpart is required too.
 */
export function getMissingAzLabels(required = [], optionalPairs = []) {
  const missing = [];

  for (const { value, label } of required) {
    if (!hasContent(value)) missing.push(label);
  }

  for (const { en, az, label } of optionalPairs) {
    if (hasContent(en) && !hasContent(az)) missing.push(label);
  }

  return missing;
}

export function alertMissingAz(missing, setFormLang) {
  if (!missing.length) return false;
  setFormLang?.("az");
  alert(`Azerbaijani fields are required:\n• ${missing.join("\n• ")}`);
  return true;
}

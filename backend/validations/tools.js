
export function validateTool(data) {
  const errors = [];
  if (!data.name) errors.push("Tool name is required");
  if (!data.official_url) errors.push("Official URL is required");
  if (!data.category) errors.push("Category is required");
  return errors;
}


export function validateReview(data) {
  const errors = [];
  if (!data.tool_id) errors.push("Tool ID is required");
  if (!data.content) errors.push("Review content is required");
  if (!data.ratings || typeof data.ratings.functionality !== "number") errors.push("Functionality rating is required");
  if (!data.ratings || typeof data.ratings.usability !== "number") errors.push("Usability rating is required");
  if (!data.ratings || typeof data.ratings.value !== "number") errors.push("Value rating is required");
  return errors;
}

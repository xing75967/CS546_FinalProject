

export function validateUserRegistration(data) {
  const errors = [];
  if (!data.email || !data.email.includes("@")) errors.push("Invalid email");
  if (!data.password || data.password.length < 6) errors.push("Password must be at least 6 characters");
  if (!data.first_name) errors.push("First name is required");
  if (!data.last_name) errors.push("Last name is required");
  return errors;
}

export function validateUserLogin(data) {
  const errors = [];
  if (!data.email) errors.push("Email is required");
  if (!data.password) errors.push("Password is required");
  return errors;
}

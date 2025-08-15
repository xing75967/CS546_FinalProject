
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || result.errors?.join(", ") || "Login failed");
        alert("Login successful");
        window.location.href = "/";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || result.errors?.join(", ") || "Registration failed");
        alert("Registration successful");
        window.location.href = "/";
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Logout
  const logoutForm = document.getElementById("logout-form");
  if (logoutForm) {
    logoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        const result = await res.json();
        alert(result.message);
        window.location.href = "/";
      } catch {
        alert("Logout failed");
      }
    });
  }
});

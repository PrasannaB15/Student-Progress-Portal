document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("registerForm");

  const API_BASE = "http://localhost:5000/api/auth";

  // Helper functions
  function showMessage(id, message, isSuccess = false) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.style.display = "block";
      el.style.color = isSuccess ? "green" : "red";
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function saveToken(token) {
    localStorage.setItem("token", token);
  }

  // 🔐 LOGIN HANDLER
  if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    document.getElementById("login-msg").style.display = "none";

    if (!email || !password) {
      showMessage("login-msg", "Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || result.message || "Login failed");

      saveToken(result.token);
      window.location.href = "dashboard.html";  // <-- redirect here on success
    } catch (err) {
      showMessage("login-msg", err.message || "Server error during login");
    }
  });
}


  // 📝 REGISTER HANDLER
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = registerForm.name.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;

      document.getElementById("error").style.display = "none";
      document.getElementById("success").style.display = "none";

      if (!name || !email || !password) {
        showMessage("error", "Please fill in all fields.");
        return;
      }

      if (!validateEmail(email)) {
        showMessage("error", "Please enter a valid email address.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await res.json();

        if (!res.ok) throw new Error(result.error || result.message || "Registration failed");

        showMessage("success", "Registration successful! Please verify your email.", true);

        setTimeout(() => {
          window.location.href = "verify.html";
        }, 3000);
      } catch (err) {
        showMessage("error", err.message || "Failed to register. Try again.");
      }
    });
  }
});

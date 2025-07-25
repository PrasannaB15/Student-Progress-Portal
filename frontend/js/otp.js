const API_BASE = "http://localhost:5000/api/auth";


document.addEventListener("DOMContentLoaded", () => {
  const verifyForm = document.getElementById("verify-form");
  const forgotForm = document.getElementById("forgot-form");
  const verifyResetForm = document.getElementById("verify-reset-form");
  const resetForm = document.getElementById("reset-form");

  if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;

  const res = await fetch(`${API_BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const result = await res.json();
  if (res.ok) {
    // Show success message, then redirect to login
    alert("✅ Verified successfully! Please login.");
    window.location.href = "login.html";
  } else {
    alert(`❌ Verification failed: ${result.error}`);
  }
});

  }

  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(forgotForm);
      const data = Object.fromEntries(formData);
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("OTP sent");
        window.location.href = "verify-reset.html";
      } else {
        showMessage("forgot-msg", result.message);
      }
    });
  }

  if (verifyResetForm) {
    verifyResetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(verifyResetForm);
      const data = Object.fromEntries(formData);
      const res = await fetch(`${API_BASE}/verify-forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("OTP verified");
        window.location.href = "reset-password.html";
      } else {
        showMessage("verify-reset-msg", result.message);
      }
    });
  }

  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(resetForm);
      const data = Object.fromEntries(formData);
      const token = getToken();
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Password reset successful");
        window.location.href = "login.html";
      } else {
        showMessage("reset-msg", result.message);
      }
    });
  }
});

const API_BASE = "http://localhost:5000/api/auth";

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();
  if (!token) {
    return logout();
  }

  const dashboardContent = document.getElementById("dashboard-content");
  if (!dashboardContent) return; // safety check

  // Show loading message
  dashboardContent.innerHTML = "<p>Loading your profile...</p>";

  try {
    const res = await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}), // no body needed or empty object
    });

    const data = await res.json();

    if (res.ok) {
      dashboardContent.innerHTML = `
        <p><strong>Email:</strong> ${data.email || "N/A"}</p>
        <p><strong>Name:</strong> ${data.name || "N/A"}</p>
        <p><strong>Verified:</strong> ✅</p>
      `;
    } else {
      dashboardContent.innerHTML = `<p style="color:red;">${data.message || "Failed to verify user."}</p>`;
      setTimeout(logout, 3000); // auto logout after showing message
    }
  } catch (error) {
    dashboardContent.innerHTML = `<p style="color:red;">Error connecting to server.</p>`;
    setTimeout(logout, 3000);
  }
});

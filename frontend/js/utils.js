const API_BASE = "http://localhost:5000/api/auth";

// Display a message inside an element by ID
function showMessage(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

// Save JWT token to localStorage
function saveToken(token) {
  localStorage.setItem("token", token);
}

// Retrieve JWT token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Logout user by removing token and redirecting
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

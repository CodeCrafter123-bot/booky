const logoutBtn = document.getElementById("logoutBtn");

const fullNameElement = document.getElementById("fullName");
const emailElement = document.getElementById("email");
const roleElement = document.getElementById("role");
const message = document.getElementById("message");

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  location.href = "login.html";
}

logoutBtn?.addEventListener("click", logout);

loadProfile();

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");

  location.href = "login.html";
}

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = text ? `message ${type}` : "message";
}

function loadProfile() {
  const fullName =
    user.fullName ||
    user.name ||
    user.username ||
    "Unknown";

  const email = user.email || "-";
  const role = user.role || "-";

  if (fullNameElement) fullNameElement.textContent = fullName;
  if (emailElement) emailElement.textContent = email;
  if (roleElement) roleElement.textContent = role;

  showMessage("");
}
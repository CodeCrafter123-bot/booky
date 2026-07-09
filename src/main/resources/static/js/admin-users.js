const API_URL = "http://127.0.0.1:8080";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("message");
const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");
const userCount = document.getElementById("userCount");

let users = [];

if (!token || !user) {
  location.href = "login.html";
}

if (user.role !== "ADMIN") {
  alert("Access denied. Admins only.");
  location.href = "dashboard.html";
}

logoutBtn?.addEventListener("click", logout);
searchInput?.addEventListener("input", filterUsers);

loadUsers();

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");
  localStorage.removeItem("selected_admin_user_id");

  location.href = "login.html";
}

function showMessage(text, type = "error") {
  if (!message) return;
  message.textContent = text;
  message.className = text ? `message ${type}` : "message";
}

async function loadUsers() {
  showMessage("");

  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Failed to load users.");
    }

    users = data || [];
    renderUsers(users);
  } catch (error) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6">Could not load users.</td>
      </tr>
    `;
    showMessage(error.message || "Something went wrong.");
  }
}

function renderUsers(list) {
  userCount.textContent = `${list.length} user${list.length === 1 ? "" : "s"} found`;

  if (!list.length) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6">No users found.</td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = list.map(u => `
    <tr>
      <td>#${u.id}</td>
      <td>${escapeHtml(u.fullName || "-")}</td>
      <td>${escapeHtml(u.email || "-")}</td>
      <td>${escapeHtml(u.phone || "-")}</td>
      <td>
        <span class="role-pill role-${(u.role || "").toLowerCase()}">
          ${escapeHtml(u.role || "-")}
        </span>
      </td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="editUser(${u.id})">
          Edit
        </button>
      </td>
    </tr>
  `).join("");
}

function filterUsers() {
  const keyword = searchInput.value.toLowerCase().trim();

  const filtered = users.filter(u =>
    String(u.id).includes(keyword) ||
    (u.fullName || "").toLowerCase().includes(keyword) ||
    (u.email || "").toLowerCase().includes(keyword) ||
    (u.phone || "").toLowerCase().includes(keyword) ||
    (u.role || "").toLowerCase().includes(keyword)
  );

  renderUsers(filtered);
}

function editUser(id) {
  localStorage.setItem("selected_admin_user_id", id);
  location.href = "admin-edit-user.html";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
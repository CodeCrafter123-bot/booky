const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  location.href = "login.html";
}

if (user?.role !== "ADMIN") {
  alert("Access denied. Admins only.");
  location.href = "dashboard.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const businessList = document.getElementById("businessList");
const message = document.getElementById("message");

const totalBusinesses = document.getElementById("totalBusinesses");
const apiStatus = document.getElementById("apiStatus");
const currentRole = document.getElementById("currentRole");

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatarInitial = document.getElementById("avatarInitial");

const displayName = user.fullName || user.name || "Admin";

if (userName) userName.textContent = displayName;
if (userRole) userRole.textContent = user.role || "ADMIN";
if (avatarInitial) avatarInitial.textContent = displayName.charAt(0).toUpperCase();
if (currentRole) currentRole.textContent = user.role || "ADMIN";

logoutBtn?.addEventListener("click", logout);
refreshBtn?.addEventListener("click", loadBusinesses);

document.querySelectorAll(".disabled-card").forEach((card) => {
  card.addEventListener("click", () => {
    alert("This admin feature needs backend support first.");
  });
});

loadBusinesses();

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");
  location.href = "login.html";
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = text ? `message ${type}` : "message";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderBusinesses(businesses) {
  if (totalBusinesses) totalBusinesses.textContent = businesses.length;
  if (apiStatus) apiStatus.textContent = "Online";

  if (!businesses.length) {
    businessList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏢</div>
        <h3>No businesses found</h3>
        <p>No businesses are currently registered.</p>
      </div>
    `;
    return;
  }

  businessList.innerHTML = businesses.map((business) => {
    const id = Number(business.id);

    return `
      <article class="admin-list-item">
        <div>
          <h3>${escapeHTML(business.name || business.businessName || "Unnamed Business")}</h3>
          <p>${escapeHTML(business.description || "No description available.")}</p>

          <div class="item-meta">
            <span>🏷️ ${escapeHTML(business.type || "N/A")}</span>
            <span>📍 ${escapeHTML(business.location || "N/A")}</span>
            <span>#${escapeHTML(id || "N/A")}</span>
          </div>
        </div>

        <button class="btn btn-ghost btn-sm" onclick="viewServices(${id})">
          View Services
        </button>
      </article>
    `;
  }).join("");
}

function viewServices(businessId) {
  localStorage.setItem("selected_business_id", businessId);
  location.href = "services.html";
}

async function loadBusinesses() {
  try {
    showMessage("Loading businesses...", "success");

    const response = await fetch(`${API_URL}/businesses`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const data = await response.json().catch(() => []);

    if (response.status === 401 || response.status === 403) {
      showMessage("Session expired or access denied.");
      localStorage.clear();

      setTimeout(() => {
        location.href = "login.html";
      }, 900);

      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not load businesses.");
    }

    showMessage("");
    renderBusinesses(Array.isArray(data) ? data : []);
  } catch (error) {
    if (apiStatus) apiStatus.textContent = "Offline";
    showMessage(error.message || "Could not connect to backend.");
  }
}
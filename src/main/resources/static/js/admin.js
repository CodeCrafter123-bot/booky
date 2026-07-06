const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  location.href = "login.html";
}

if (user.role !== "ADMIN") {
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

userName.textContent = user.fullName || user.name || "Admin";
userRole.textContent = user.role || "ADMIN";
avatarInitial.textContent = (user.fullName || user.name || "A").charAt(0).toUpperCase();
currentRole.textContent = user.role || "ADMIN";

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");
  location.href = "login.html";
});

refreshBtn.addEventListener("click", loadBusinesses);

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function renderBusinesses(businesses) {
  totalBusinesses.textContent = businesses.length;
  apiStatus.textContent = "Online";

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

  businessList.innerHTML = businesses.map(business => `
    <article class="admin-list-item">
      <div>
        <h3>${business.name}</h3>
        <p>${business.description || "No description available."}</p>
        <div class="item-meta">
          <span>🏷️ ${business.type || "N/A"}</span>
          <span>📍 ${business.location || "N/A"}</span>
          <span>#${business.id}</span>
        </div>
      </div>

      <button class="btn btn-ghost btn-sm" onclick="viewServices(${business.id})">
        View Services
      </button>
    </article>
  `).join("");
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

    if (response.status === 401 || response.status === 403) {
      showMessage("Session expired or access denied.");
      localStorage.clear();

      setTimeout(() => {
        location.href = "login.html";
      }, 1000);

      return;
    }

    if (!response.ok) {
      throw new Error("Could not load businesses.");
    }

    const businesses = await response.json();

    showMessage("");
    renderBusinesses(businesses);

  } catch (error) {
    apiStatus.textContent = "Offline";
    showMessage(error.message || "Could not connect to backend.");
  }
}

document.querySelectorAll(".disabled-card").forEach(card => {
  card.addEventListener("click", () => {
    alert("This admin feature needs backend support first.");
  });
});

loadBusinesses();
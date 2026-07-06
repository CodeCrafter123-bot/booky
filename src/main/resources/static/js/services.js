const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");
const businessId = localStorage.getItem("selected_business_id");

const servicesGrid = document.getElementById("servicesGrid");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

if (!token) {
  location.href = "login.html";
}

if (!businessId) {
  showMessage("No business selected. Go back and choose a business.");
}

logoutBtn?.addEventListener("click", logout);

loadServices();

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

function formatPrice(price) {
  if (price === null || price === undefined || price === "") {
    return "N/A";
  }

  return `$${Number(price).toFixed(2)}`;
}

function renderServices(services) {
  if (!servicesGrid) return;

  if (!services.length) {
    servicesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛠️</div>
        <h3>No services found</h3>
        <p>This business does not have services yet.</p>
      </div>
    `;
    return;
  }

  servicesGrid.innerHTML = services.map((service) => {
    const isActive = service.active !== false;
    const status = isActive ? "Active" : "Inactive";

    return `
      <article class="item-card">
        <div class="item-card-top">
          <span class="badge ${isActive ? "badge-confirmed" : "badge-cancelled"}">
            ${status}
          </span>
        </div>

        <h3>${escapeHTML(service.name || "Unnamed Service")}</h3>

        <p class="item-desc">
          ${escapeHTML(service.description || "No description available.")}
        </p>

        <div class="item-meta">
          <span>⏱️ ${escapeHTML(service.durationMinutes || "N/A")} minutes</span>
          <span>💵 ${escapeHTML(formatPrice(service.price))}</span>
        </div>

        <div class="item-card-footer">
          <button
            class="btn btn-primary btn-block"
            onclick="bookService(${Number(service.id)})"
            ${!isActive ? "disabled" : ""}
          >
            ${isActive ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function bookService(serviceId) {
  localStorage.setItem("selected_service_id", serviceId);
  location.href = "book.html";
}

async function loadServices() {
  if (!businessId) return;

  showMessage("Loading services...", "success");

  try {
    const response = await fetch(`${API_URL}/services/business/${businessId}`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const data = await response.json().catch(() => []);

    if (response.status === 401 || response.status === 403) {
      showMessage("Session expired. Please log in again.");
      localStorage.clear();

      setTimeout(() => {
        location.href = "login.html";
      }, 900);

      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not load services.");
    }

    showMessage("");
    renderServices(Array.isArray(data) ? data : []);
  } catch (error) {
    showMessage(error.message || "Could not load services.");
    servicesGrid.innerHTML = "";
  }
}
const t = window.bookyI18n.start();

const API_URL = "/businesses";

const token = localStorage.getItem("booky_token");

const grid = document.getElementById("businessGrid");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");

let businesses = [];

if (!token) {
  location.href = "login.html";
}

refreshBtn?.addEventListener("click", loadBusinesses);
searchInput?.addEventListener("input", filterBusinesses);

loadBusinesses();

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("booky_token")}`
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

function render(items) {
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏢</div>
        <h3>${t("browse.empty.title", "No businesses found")}</h3>
        <p>${t("browse.empty.text", "Try searching by another name, type, or location.")}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items
    .map((business) => {
      const id = Number(business.id);

      return `
        <article class="item-card">

          <div class="item-card-top">
            <span class="item-tag">
              ${escapeHTML(business.type || t("browse.typeFallback", "Business"))}
            </span>
          </div>

          <h3>
            ${escapeHTML(
              business.name ||
              business.businessName ||
              t("browse.unnamed", "Unnamed Business")
            )}
          </h3>

          <div class="item-meta">
            <span>
              📍 ${escapeHTML(
                business.location ||
                t("common.notSpecified", "Not specified")
              )}
            </span>
          </div>

          <p class="item-desc">
            ${escapeHTML(
              business.description ||
              t("common.noDescription", "No description available.")
            )}
          </p>

          <div class="item-card-footer business-card-actions">

            <button
              type="button"
              class="btn btn-primary btn-block"
              onclick="viewBusinessDetails(${id})"
            >
              ${t("browse.viewDetails", "View Details")}
            </button>

            <button
              type="button"
              class="btn btn-ghost btn-block"
              onclick="viewServices(${id})"
            >
              ${t("browse.viewServices", "View Services")}
            </button>

          </div>

        </article>
      `;
    })
    .join("");
}

function viewBusinessDetails(id) {
  if (!Number.isInteger(id) || id <= 0) {
    showMessage(t("browse.invalid", "Invalid business selected."));
    return;
  }

  localStorage.setItem("selected_business_id", String(id));
  location.href = `business-details.html?id=${id}`;
}

function viewServices(id) {
  if (!Number.isInteger(id) || id <= 0) {
    showMessage(t("browse.invalid", "Invalid business selected."));
    return;
  }

  localStorage.setItem("selected_business_id", String(id));
  location.href = "services.html";
}

function filterBusinesses() {
  const query = searchInput?.value.trim().toLowerCase() || "";

  const filteredBusinesses = businesses.filter((business) => {
    const searchableText = `
      ${business.name || ""}
      ${business.businessName || ""}
      ${business.type || ""}
      ${business.location || ""}
      ${business.description || ""}
    `.toLowerCase();

    return searchableText.includes(query);
  });

  render(filteredBusinesses);
}

async function loadBusinesses() {
  showMessage(t("browse.loading", "Loading businesses..."), "success");

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const data = await response.json().catch(() => []);

    if (response.status === 401 || response.status === 403) {
      showMessage(t("common.sessionExpired", "Session expired. Please log in again."));

      setTimeout(() => {
        localStorage.clear();
        location.href = "login.html";
      }, 900);

      return;
    }

    if (!response.ok) {
      throw new Error(
        bookyI18n.tm(data.message) ||
        t("browse.loadError", "Could not load businesses.")
      );
    }

    businesses = Array.isArray(data) ? data : [];

    showMessage("");
    render(businesses);

  } catch (error) {
    showMessage(
      error.message ||
      t("browse.loadError", "Could not load businesses.")
    );

    if (grid) {
      grid.innerHTML = "";
    }
  }
}
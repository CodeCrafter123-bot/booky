
const API_URL = "http://127.0.0.1:8080";

const token = localStorage.getItem("booky_token");
const currentUser = JSON.parse(
  localStorage.getItem("booky_user") || "null"
);

const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("message");
const reviewsGrid = document.getElementById("reviewsGrid");
const searchInput = document.getElementById("searchInput");
const averageRating = document.getElementById("averageRating");
const reviewCount = document.getElementById("reviewCount");

let reviews = [];

if (!token || !currentUser) {
  location.href = "login.html";
}

if (currentUser?.role !== "OWNER") {
  alert("Access denied. Owners only.");
  location.href = "dashboard.html";
}

logoutBtn?.addEventListener("click", logout);
searchInput?.addEventListener("input", filterReviews);

loadReviews();

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
  message.className = text
    ? `message ${type}`
    : "message";
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function renderStars(rating) {
  const value = Number(rating) || 0;

  return Array.from(
    { length: 5 },
    (_, index) => index < value ? "★" : "☆"
  ).join("");
}

async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  const clonedResponse = response.clone();

  if (response.status === 401 || response.status === 403) {
    const data = await clonedResponse
      .json()
      .catch(() => null);

    if (data?.code === "ACCOUNT_FROZEN") {
      localStorage.clear();

      alert(
        `${data.message}\nReason: ${
          data.reason || "Contact the administrator."
        }`
      );

      location.href = "login.html";
      throw new Error("Account frozen");
    }

    if (response.status === 401) {
      localStorage.clear();
      alert("Your session has expired.");
      location.href = "login.html";
      throw new Error("Session expired");
    }
  }

  return response;
}

async function loadReviews() {
  showMessage("Loading reviews...", "success");

  try {
    const response = await authenticatedFetch(
      `${API_URL}/reviews/owner`
    );

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error(
        data?.message || "Could not load reviews."
      );
    }

    reviews = Array.isArray(data) ? data : [];

    showMessage("");
    updateSummary(reviews);
    renderReviews(reviews);
  } catch (error) {
    if (
      error.message === "Account frozen" ||
      error.message === "Session expired"
    ) {
      return;
    }

    showMessage(
      error.message || "Could not load reviews."
    );

    reviewsGrid.innerHTML = `
      <div class="empty-state">
        <p>Could not load reviews.</p>
      </div>
    `;
  }
}

function updateSummary(list) {
  reviewCount.textContent =
    `${list.length} review${list.length === 1 ? "" : "s"}`;

  if (!list.length) {
    averageRating.textContent = "0.0 ★";
    return;
  }

  const total = list.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0
  );

  const average = total / list.length;

  averageRating.textContent = `${average.toFixed(1)} ★`;
}

function renderReviews(list) {
  if (!list.length) {
    reviewsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <h3>No reviews yet</h3>
        <p>
          Customer feedback for your businesses will appear here.
        </p>
      </div>
    `;
    return;
  }

  reviewsGrid.innerHTML = list.map(review => `
    <article class="glass-card review-card">
      <div class="review-card-head">
        <div>
          <span class="review-business">
            ${escapeHTML(review.businessName || "Business")}
          </span>

          <h3>
            ${escapeHTML(review.serviceName || "Service")}
          </h3>
        </div>

        <span class="review-rating">
          ${renderStars(review.rating)}
        </span>
      </div>

      <p class="review-comment">
        ${
          review.comment
            ? escapeHTML(review.comment)
            : "No written comment."
        }
      </p>

      <div class="review-meta">
        <span>
          <strong>Client:</strong>
          ${escapeHTML(review.clientName || "-")}
        </span>

        <span>
          <strong>Email:</strong>
          ${escapeHTML(review.clientEmail || "-")}
        </span>

        <span>
          <strong>Appointment:</strong>
          ${escapeHTML(formatDateTime(review.appointmentTime))}
        </span>

        <span>
          <strong>Reviewed:</strong>
          ${escapeHTML(formatDateTime(review.createdAt))}
        </span>
      </div>
    </article>
  `).join("");
}

function filterReviews() {
  const keyword =
    searchInput.value.toLowerCase().trim();

  const filtered = reviews.filter(review =>
    (review.businessName || "")
      .toLowerCase()
      .includes(keyword) ||

    (review.clientName || "")
      .toLowerCase()
      .includes(keyword) ||

    (review.clientEmail || "")
      .toLowerCase()
      .includes(keyword) ||

    (review.serviceName || "")
      .toLowerCase()
      .includes(keyword) ||

    (review.comment || "")
      .toLowerCase()
      .includes(keyword) ||

    String(review.rating).includes(keyword)
  );

  updateSummary(filtered);
  renderReviews(filtered);
}

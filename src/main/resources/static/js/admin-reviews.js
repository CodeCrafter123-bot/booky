const API_URL = "http://127.0.0.1:8080";

const token = localStorage.getItem("booky_token");
const currentUser = JSON.parse(
  localStorage.getItem("booky_user") || "null"
);

const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("message");
const reviewsTableBody = document.getElementById("reviewsTableBody");
const searchInput = document.getElementById("searchInput");
const reviewCount = document.getElementById("reviewCount");

let reviews = [];

if (!token || !currentUser) {
  location.href = "login.html";
}

if (currentUser?.role !== "ADMIN") {
  alert("Access denied. Admins only.");
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
  localStorage.removeItem("selected_admin_user_id");

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
  const numericRating = Number(rating) || 0;

  return Array.from(
    { length: 5 },
    (_, index) => index < numericRating ? "★" : "☆"
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

  if (response.status === 401 || response.status === 403) {
    const data = await response
      .clone()
      .json()
      .catch(() => null);

    if (data?.code === "ACCOUNT_FROZEN") {
      localStorage.removeItem("booky_token");
      localStorage.removeItem("booky_user");

      alert(
        `${data.message || "Your account has been frozen."}\n` +
        `Reason: ${data.reason || "Contact the administrator."}`
      );

      location.href = "login.html";
      throw new Error("Account frozen");
    }

    if (response.status === 401) {
      localStorage.removeItem("booky_token");
      localStorage.removeItem("booky_user");

      alert("Your session has expired. Please log in again.");

      location.href = "login.html";
      throw new Error("Session expired");
    }
  }

  return response;
}

async function loadReviews() {
  showMessage("Loading reviews...", "success");

  reviewsTableBody.innerHTML = `
    <tr>
      <td colspan="8">Loading reviews...</td>
    </tr>
  `;

  try {
    const response = await authenticatedFetch(
      `${API_URL}/reviews/admin`,
      {
        method: "GET"
      }
    );

    const data = await response
      .json()
      .catch(() => []);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Could not load reviews."
      );
    }

    reviews = Array.isArray(data) ? data : [];

    showMessage("");
    filterReviews();
  } catch (error) {
    if (
      error.message === "Account frozen" ||
      error.message === "Session expired"
    ) {
      return;
    }

    reviewsTableBody.innerHTML = `
      <tr>
        <td colspan="8">Could not load reviews.</td>
      </tr>
    `;

    showMessage(
      error.message || "Could not load reviews."
    );
  }
}

function renderReviews(list) {
  reviewCount.textContent =
    `${list.length} review${list.length === 1 ? "" : "s"} found`;

  if (!list.length) {
    reviewsTableBody.innerHTML = `
      <tr>
        <td colspan="8">No reviews found.</td>
      </tr>
    `;
    return;
  }

  reviewsTableBody.innerHTML = list.map(review => `
    <tr>
      <td>#${Number(review.id)}</td>

      <td>
        ${escapeHTML(review.businessName || "-")}
      </td>

      <td>
        ${escapeHTML(review.serviceName || "-")}
      </td>

      <td>
        <strong>${escapeHTML(review.clientName || "-")}</strong>
        <br />
        <small>${escapeHTML(review.clientEmail || "-")}</small>
      </td>

      <td>
        <span class="review-rating">
          ${renderStars(review.rating)}
        </span>
        <br />
        <small>${Number(review.rating) || 0}/5</small>
      </td>

      <td class="admin-review-comment">
        ${
          review.comment
            ? escapeHTML(review.comment)
            : "No written comment."
        }
      </td>

      <td>
        ${escapeHTML(formatDateTime(review.createdAt))}
      </td>

      <td>
        <button
          type="button"
          class="btn btn-danger btn-sm"
          onclick="deleteReview(${Number(review.id)})"
        >
          Delete
        </button>
      </td>
    </tr>
  `).join("");
}

function filterReviews() {
  const keyword =
    searchInput?.value.toLowerCase().trim() || "";

  const filtered = reviews.filter(review =>
    String(review.id).includes(keyword) ||
    String(review.rating).includes(keyword) ||
    (review.businessName || "")
      .toLowerCase()
      .includes(keyword) ||
    (review.serviceName || "")
      .toLowerCase()
      .includes(keyword) ||
    (review.clientName || "")
      .toLowerCase()
      .includes(keyword) ||
    (review.clientEmail || "")
      .toLowerCase()
      .includes(keyword) ||
    (review.comment || "")
      .toLowerCase()
      .includes(keyword)
  );

  renderReviews(filtered);
}

async function deleteReview(reviewId) {
  const selectedReview = reviews.find(
    review => Number(review.id) === Number(reviewId)
  );

  const reviewName = selectedReview
    ? `${selectedReview.clientName || "this client"}'s review`
    : "this review";

  const confirmed = confirm(
    `Are you sure you want to delete ${reviewName}?`
  );

  if (!confirmed) return;

  showMessage("Deleting review...", "success");

  try {
    const response = await authenticatedFetch(
      `${API_URL}/reviews/${reviewId}`,
      {
        method: "DELETE"
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Could not delete review."
      );
    }

    reviews = reviews.filter(
      review => Number(review.id) !== Number(reviewId)
    );

    filterReviews();

    showMessage(
      data?.message || "Review deleted successfully.",
      "success"
    );
  } catch (error) {
    if (
      error.message === "Account frozen" ||
      error.message === "Session expired"
    ) {
      return;
    }

    showMessage(
      error.message || "Could not delete review."
    );
  }
}
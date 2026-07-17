
const API_BASE_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");

const urlParameters = new URLSearchParams(window.location.search);
const businessId = Number(urlParameters.get("id"));

const message = document.getElementById("message");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorText = document.getElementById("errorText");
const businessContent = document.getElementById("businessContent");

const businessInitial = document.getElementById("businessInitial");
const businessType = document.getElementById("businessType");
const businessName = document.getElementById("businessName");
const businessLocation = document.getElementById("businessLocation");
const businessDescription = document.getElementById(
  "businessDescription"
);

const averageRating = document.getElementById("averageRating");
const reviewCount = document.getElementById("reviewCount");
const serviceCount = document.getElementById("serviceCount");

const servicesList = document.getElementById("servicesList");
const businessHours = document.getElementById("businessHours");
const reviewsList = document.getElementById("reviewsList");

const bookNowBtn = document.getElementById("bookNowBtn");
const logoutBtn = document.getElementById("logoutBtn");

if (!token) {
  location.href = "login.html";
}

bookNowBtn?.addEventListener("click", openServicesPage);
logoutBtn?.addEventListener("click", logout);

initializePage();

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("booky_token")}`
  };
}

async function initializePage() {
  if (!Number.isInteger(businessId) || businessId <= 0) {
    showPageError("The selected business ID is invalid.");
    return;
  }

  try {
    await loadBusiness();

    businessContent.hidden = false;

    await Promise.allSettled([
      loadServices(),
      loadBusinessHours(),
      loadReviews()
    ]);
  } catch (error) {
    console.error(error);

    showPageError(
      error.message ||
      "The business details could not be loaded."
    );
  } finally {
    loadingState.hidden = true;
  }
}

async function loadBusiness() {
  const response = await fetch(
    `${API_BASE_URL}/businesses/${businessId}`,
    {
      method: "GET",
      headers: getAuthHeaders()
    }
  );

  const data = await readJsonResponse(response);

  handleAuthenticationError(response);

  if (!response.ok) {
    throw new Error(
      data.message ||
      `Business with ID ${businessId} could not be found.`
    );
  }

  const name =
    data.name ||
    data.businessName ||
    "Unnamed Business";

  businessName.textContent = name;

  businessType.textContent =
    data.type ||
    "Business";

  businessLocation.textContent =
    `📍 ${data.location || "Location not specified"}`;

  businessDescription.textContent =
    data.description ||
    "No description is available for this business.";

  businessInitial.textContent =
    name.trim().charAt(0).toUpperCase() || "B";

  document.title = `${name} — Booky`;
}

async function loadServices() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/services/business/${businessId}`,
      {
        method: "GET",
        headers: getAuthHeaders()
      }
    );

    const data = await readJsonResponse(response);

    handleAuthenticationError(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Services could not be loaded."
      );
    }

    const services = Array.isArray(data)
      ? data.filter((service) => service.active !== false)
      : [];

    serviceCount.textContent =
      `${services.length} ${
        services.length === 1 ? "service" : "services"
      }`;

    renderServices(services);
  } catch (error) {
    console.error(error);

    serviceCount.textContent = "0 services";

    servicesList.innerHTML = `
      <p class="content-error">
        ${escapeHTML(
          error.message ||
          "Services could not be loaded."
        )}
      </p>
    `;
  }
}

function renderServices(services) {
  if (!services.length) {
    servicesList.innerHTML = `
      <p class="empty-content">
        This business does not currently have active services.
      </p>
    `;

    return;
  }

  servicesList.innerHTML = services
    .map((service) => {
      const serviceId = Number(service.id);

      return `
        <article class="service-card">

          <div class="service-information">

            <h3>
              ${escapeHTML(
                service.name ||
                service.serviceName ||
                "Unnamed Service"
              )}
            </h3>

            <p>
              ${escapeHTML(
                service.description ||
                "No description is available for this service."
              )}
            </p>

            <div class="service-meta">

              <span>
                ⏱ ${formatDuration(
                  service.durationMinutes
                )}
              </span>

              <span class="service-price">
                ${formatPrice(service.price)}
              </span>

            </div>

          </div>

          <div class="service-action">

            <button
              type="button"
              class="btn btn-primary"
              onclick="bookService(${serviceId})"
            >
              Book Service
            </button>

          </div>

        </article>
      `;
    })
    .join("");
}

async function loadBusinessHours() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/business-hours/${businessId}`,
      {
        method: "GET",
        headers: getAuthHeaders()
      }
    );

    const data = await readJsonResponse(response);

    handleAuthenticationError(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Business hours could not be loaded."
      );
    }

    const hours = Array.isArray(data) ? data : [];

    renderBusinessHours(hours);
  } catch (error) {
    console.error(error);

    businessHours.innerHTML = `
      <p class="content-error">
        ${escapeHTML(
          error.message ||
          "Business hours could not be loaded."
        )}
      </p>
    `;
  }
}

function renderBusinessHours(hours) {
  if (!hours.length) {
    businessHours.innerHTML = `
      <p class="empty-content">
        Business hours have not been added yet.
      </p>
    `;

    return;
  }

  const dayOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY"
  ];

  const sortedHours = [...hours].sort((first, second) => {
    return (
      dayOrder.indexOf(
        String(first.dayOfWeek || "").toUpperCase()
      ) -
      dayOrder.indexOf(
        String(second.dayOfWeek || "").toUpperCase()
      )
    );
  });

  businessHours.innerHTML = sortedHours
    .map((day) => {
      const isClosed =
        day.closed === true ||
        day.isClosed === true;

      return `
        <div class="hours-row">

          <span class="hours-day">
            ${escapeHTML(formatDay(day.dayOfWeek))}
          </span>

          <span class="hours-time ${isClosed ? "closed" : ""}">
            ${
              isClosed
                ? "Closed"
                : `${formatTime(day.openTime)}
                   – ${formatTime(day.closeTime)}`
            }
          </span>

        </div>
      `;
    })
    .join("");
}

async function loadReviews() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reviews/business/${businessId}`,
      {
        method: "GET",
        headers: getAuthHeaders()
      }
    );

    const data = await readJsonResponse(response);

    handleAuthenticationError(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Reviews could not be loaded."
      );
    }

    const reviews = Array.isArray(data) ? data : [];

    updateRatingSummary(reviews);
    renderReviews(reviews);
  } catch (error) {
    console.error(error);

    averageRating.textContent = "0.0";
    reviewCount.textContent = "0 reviews";

    reviewsList.innerHTML = `
      <p class="content-error">
        ${escapeHTML(
          error.message ||
          "Reviews could not be loaded."
        )}
      </p>
    `;
  }
}

function updateRatingSummary(reviews) {
  if (!reviews.length) {
    averageRating.textContent = "0.0";
    reviewCount.textContent = "0 reviews";
    return;
  }

  const totalRating = reviews.reduce((total, review) => {
    return total + Number(review.rating || 0);
  }, 0);

  const average = totalRating / reviews.length;

  averageRating.textContent = average.toFixed(1);

  reviewCount.textContent =
    `${reviews.length} ${
      reviews.length === 1 ? "review" : "reviews"
    }`;
}

function renderReviews(reviews) {
  if (!reviews.length) {
    reviewsList.innerHTML = `
      <p class="empty-content">
        This business does not have customer reviews yet.
      </p>
    `;

    return;
  }

  reviewsList.innerHTML = reviews
    .map((review) => {
      const reviewerName =
        review.clientName ||
        review.userName ||
        "Booky Client";

      const serviceName =
        review.serviceName ||
        "";

      return `
        <article class="review-card">

          <div class="review-header">

            <div>

              <p class="reviewer-name">
                ${escapeHTML(reviewerName)}
              </p>

              <div
                class="review-stars"
                aria-label="${normalizeRating(
                  review.rating
                )} out of 5 stars"
              >
                ${createStars(review.rating)}
              </div>

            </div>

            <time class="review-date">
              ${formatDate(review.createdAt)}
            </time>

          </div>

          <p class="review-comment">
            ${escapeHTML(
              review.comment ||
              "The customer did not leave a written comment."
            )}
          </p>

          ${
            serviceName
              ? `
                <div class="review-service">
                  Service: ${escapeHTML(serviceName)}
                </div>
              `
              : ""
          }

        </article>
      `;
    })
    .join("");
}

function bookService(serviceId) {
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    showMessage("The selected service is invalid.");
    return;
  }

  localStorage.setItem(
    "selected_business_id",
    String(businessId)
  );

  localStorage.setItem(
    "selected_service_id",
    String(serviceId)
  );

  location.href = `book.html?serviceId=${serviceId}`;
}

function openServicesPage() {
  localStorage.setItem(
    "selected_business_id",
    String(businessId)
  );

  location.href = "services.html";
}

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");

  location.href = "login.html";
}

function showPageError(text) {
  loadingState.hidden = true;
  businessContent.hidden = true;

  errorText.textContent = text;
  errorState.hidden = false;
}

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className =
    text ? `message ${type}` : "message";
}

function handleAuthenticationError(response) {
  if (
    response.status !== 401 &&
    response.status !== 403
  ) {
    return;
  }

  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");

  location.href = "login.html";

  throw new Error(
    "Your session has expired. Please log in again."
  );
}

async function readJsonResponse(response) {
  return response.json().catch(() => ({}));
}

function formatDuration(durationMinutes) {
  const duration = Number(durationMinutes);

  if (!Number.isFinite(duration) || duration <= 0) {
    return "Duration not specified";
  }

  if (duration < 60) {
    return `${duration} minutes`;
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${hours}h ${minutes}m`;
}

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price not specified";
  }

  return `$${numericPrice.toFixed(2)}`;
}

function formatDay(day) {
  if (!day) {
    return "Unknown";
  }

  const normalizedDay = String(day)
    .trim()
    .toLowerCase();

  return (
    normalizedDay.charAt(0).toUpperCase() +
    normalizedDay.slice(1)
  );
}

function formatTime(time) {
  if (!time) {
    return "--:--";
  }

  const parts = String(time).split(":");

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes)
  ) {
    return String(time).slice(0, 5);
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function normalizeRating(rating) {
  return Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  );
}

function createStars(rating) {
  const normalizedRating = normalizeRating(rating);

  return (
    "★".repeat(normalizedRating) +
    "☆".repeat(5 - normalizedRating)
  );
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


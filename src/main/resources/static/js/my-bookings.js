
const API_URL = "";
const BOOKY_TIME_ZONE = "Asia/Beirut";
const token = localStorage.getItem("booky_token");
const currentUser = JSON.parse(
  localStorage.getItem("booky_user") || "null"
);

const bookingsGrid = document.getElementById("bookingsGrid");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

const reviewModal = document.getElementById("reviewModal");
const reviewModalBackdrop = document.getElementById(
  "reviewModalBackdrop"
);
const closeReviewModalBtn = document.getElementById(
  "closeReviewModalBtn"
);
const cancelReviewBtn = document.getElementById("cancelReviewBtn");
const submitReviewBtn = document.getElementById("submitReviewBtn");

const reviewBookingText = document.getElementById(
  "reviewBookingText"
);
const reviewComment = document.getElementById("reviewComment");
const reviewCharacterCount = document.getElementById(
  "reviewCharacterCount"
);
const ratingText = document.getElementById("ratingText");
const starButtons = document.querySelectorAll(".star-btn");

let bookings = [];
let clientReviews = [];
let selectedBookingId = null;
let selectedRating = 0;

if (!token || !currentUser) {
  location.href = "login.html";
}

if (currentUser?.role !== "CLIENT") {
  alert("Access denied. Clients only.");
  location.href = "dashboard.html";
}

logoutBtn?.addEventListener("click", logout);

closeReviewModalBtn?.addEventListener(
  "click",
  closeReviewModal
);

cancelReviewBtn?.addEventListener(
  "click",
  closeReviewModal
);

reviewModalBackdrop?.addEventListener(
  "click",
  closeReviewModal
);

submitReviewBtn?.addEventListener(
  "click",
  submitReview
);

reviewComment?.addEventListener("input", () => {
  reviewCharacterCount.textContent =
    reviewComment.value.length;
});

starButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectRating(Number(button.dataset.rating));
  });

  button.addEventListener("mouseenter", () => {
    highlightStars(Number(button.dataset.rating));
  });

  button.addEventListener("mouseleave", () => {
    highlightStars(selectedRating);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeReviewModal();
  }
});

loadPage();

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");

  location.href = "login.html";
}

function getAuthHeaders(includeJson = true) {
  const headers = {
    Authorization: `Bearer ${token}`
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
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

function lebanonDateTimeKey(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  return (
    `${values.year}-${values.month}-${values.day}` +
    `T${values.hour}:${values.minute}:${values.second}`
  );
}

function parseAppointmentTime(value) {
  if (typeof value !== "string") return null;

  // The API returns a Lebanon local datetime without a timezone suffix.
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/.exec(value);

  if (!match) return null;

  const localKey =
    `${match[1]}T${match[2]}:${match[3] || "00"}`;

  // Temporary reference for calculating the Beirut offset.
  // This is not yet the appointment's actual instant.
  const reference = Date.parse(`${localKey}Z`);

  if (
    !Number.isFinite(reference) ||
    new Date(reference).toISOString().slice(0, 19) !== localKey
  ) {
    return null;
  }

  const milliseconds = Number(
    (match[4] || "").padEnd(3, "0").slice(0, 3)
  );

  const candidates = new Set();

  // Check offsets around the appointment to account for clock changes.
  for (const hours of [-36, 0, 36]) {
    const probe = reference + hours * 60 * 60 * 1000;

    const offset =
      Date.parse(`${lebanonDateTimeKey(new Date(probe))}Z`) - probe;

    const candidate = reference - offset;

    if (lebanonDateTimeKey(new Date(candidate)) === localKey) {
      candidates.add(candidate);
    }
  }

  // Match the backend: reject nonexistent or ambiguous local times.
  if (candidates.size !== 1) return null;

  return new Date([...candidates][0] + milliseconds);
}

function formatDateTime(dateTime) {
  const date = parseAppointmentTime(dateTime);

  if (!date) return "Invalid appointment time";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKY_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date) + " (Lebanon time)";
}

function getServiceName(booking) {
  return booking.service?.name ||
    booking.serviceName ||
    "Service";
}

function getBusinessName(booking) {
  return booking.business?.name ||
    booking.businessName ||
    booking.service?.business?.name ||
    "Business";
}

function isPastAppointment(booking) {
  const appointment = parseAppointmentTime(
    booking.appointmentTime
  );

  if (!appointment) return false;

  return appointment.getTime() <= Date.now();
}

function findReviewForBooking(bookingId) {
  return clientReviews.find(
    review =>
      Number(review.bookingId) === Number(bookingId)
  );
}

async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (
    response.status === 401 ||
    response.status === 403
  ) {
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

async function loadPage() {
  showMessage("Loading bookings...", "success");

  try {
    await Promise.all([
      loadBookings(),
      loadClientReviews()
    ]);

    showMessage("");
    renderBookings(bookings);
  } catch (error) {
    if (
      error.message === "Account frozen" ||
      error.message === "Session expired"
    ) {
      return;
    }

    showMessage(
      error.message || "Could not load your bookings."
    );

    bookingsGrid.innerHTML = "";
  }
}

async function loadBookings() {
  const response = await authenticatedFetch(
    `${API_URL}/bookings/my`,
    {
      method: "GET"
    }
  );

  const data = await response
    .json()
    .catch(() => []);

  if (!response.ok) {
    throw new Error(
      data?.message || "Could not load bookings."
    );
  }

  bookings = Array.isArray(data) ? data : [];
}

async function loadClientReviews() {
  const response = await authenticatedFetch(
    `${API_URL}/reviews/client`,
    {
      method: "GET"
    }
  );

  const data = await response
    .json()
    .catch(() => []);

  if (!response.ok) {
    throw new Error(
      data?.message || "Could not load reviews."
    );
  }

  clientReviews = Array.isArray(data) ? data : [];
}

function renderBookings(list) {
  if (!bookingsGrid) return;

  if (!list.length) {
    bookingsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No bookings found</h3>
        <p>Your appointments will appear here after booking a service.</p>
      </div>
    `;
    return;
  }

  bookingsGrid.innerHTML = list
    .map(booking => {
      const serviceName = getServiceName(booking);
      const businessName = getBusinessName(booking);
      const appointmentTime = formatDateTime(
        booking.appointmentTime
      );

      const status =
        (booking.status || "PENDING").toUpperCase();

      const statusClass = status.toLowerCase();
      const appointmentPassed = isPastAppointment(booking);
      const existingReview = findReviewForBooking(
        booking.id
      );

      const canCancel =
        status !== "CANCELLED" &&
        !appointmentPassed;

      const canReview =
        status === "CONFIRMED" &&
        appointmentPassed &&
        !existingReview;

      const cancelButton = canCancel
        ? `
          <button
            class="btn btn-danger booking-cancel-btn"
            type="button"
            onclick="cancelBooking(${Number(booking.id)})"
          >
            Cancel Booking
          </button>
        `
        : "";

      const reviewButton = canReview
        ? `
          <button
            class="btn btn-primary"
            type="button"
            onclick="openReviewModal(${Number(booking.id)})"
          >
            Leave Review
          </button>
        `
        : "";

      const reviewDisplay = existingReview
        ? `
          <div class="submitted-review">
            <div class="submitted-review-head">
              <strong>Your Review</strong>
              <span class="review-stars">
                ${renderStars(existingReview.rating)}
              </span>
            </div>

            <p>
              ${
                existingReview.comment
                  ? escapeHTML(existingReview.comment)
                  : "No written comment."
              }
            </p>
          </div>
        `
        : "";

      return `
        <article class="item-card booking-card">
          <div class="booking-card-header">
            <span class="badge status-${escapeHTML(statusClass)}">
              ${escapeHTML(status)}
            </span>

            ${
              appointmentPassed
  ? `<span class="booking-time-label">Start time passed</span>`
  : `<span class="booking-time-label">Upcoming</span>`
}
          </div>

          <h3>${escapeHTML(serviceName)}</h3>

          <p>
            <strong>Business:</strong>
            ${escapeHTML(businessName)}
          </p>

          <p>
            <strong>Appointment:</strong>
            ${escapeHTML(appointmentTime)}
          </p>

          <p>
            <strong>Status:</strong>
            ${escapeHTML(status)}
          </p>

          ${reviewDisplay}

          <div class="booking-actions">
            ${cancelButton}
            ${reviewButton}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStars(rating) {
  const numericRating = Number(rating) || 0;

  return Array.from(
    { length: 5 },
    (_, index) =>
      index < numericRating ? "★" : "☆"
  ).join("");
}

function openReviewModal(bookingId) {
  const booking = bookings.find(
    item => Number(item.id) === Number(bookingId)
  );

  if (!booking) {
    showMessage("Booking could not be found.");
    return;
  }

  if (
    booking.status?.toUpperCase() !== "CONFIRMED"
  ) {
    showMessage(
      "Only confirmed bookings can be reviewed."
    );
    return;
  }

  if (!isPastAppointment(booking)) {
    showMessage(
      "You can review this booking after the appointment."
    );
    return;
  }

  if (findReviewForBooking(bookingId)) {
    showMessage(
      "This booking has already been reviewed."
    );
    return;
  }

  selectedBookingId = bookingId;
  selectedRating = 0;

  reviewBookingText.textContent =
    `${getServiceName(booking)} at ` +
    `${getBusinessName(booking)} — ` +
    `${formatDateTime(booking.appointmentTime)}`;

  reviewComment.value = "";
  reviewCharacterCount.textContent = "0";

  selectRating(0);

  reviewModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeReviewModal() {
  selectedBookingId = null;
  selectedRating = 0;

  if (reviewComment) {
    reviewComment.value = "";
  }

  if (reviewCharacterCount) {
    reviewCharacterCount.textContent = "0";
  }

  selectRating(0);

  reviewModal?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function selectRating(rating) {
  selectedRating = rating;
  highlightStars(rating);

  const ratingLabels = {
    0: "Select a rating",
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very good",
    5: "Excellent"
  };

  ratingText.textContent =
    ratingLabels[rating] || "Select a rating";
}

function highlightStars(rating) {
  starButtons.forEach(button => {
    const buttonRating = Number(
      button.dataset.rating
    );

    button.classList.toggle(
      "active",
      buttonRating <= rating
    );

    button.setAttribute(
      "aria-checked",
      buttonRating === selectedRating
        ? "true"
        : "false"
    );
  });
}

async function submitReview() {
  if (!selectedBookingId) {
    showMessage("No booking was selected.");
    closeReviewModal();
    return;
  }

  if (selectedRating < 1 || selectedRating > 5) {
    alert("Please select a rating from 1 to 5 stars.");
    return;
  }

  const comment = reviewComment.value.trim();

  if (comment.length > 1000) {
    alert("The review comment cannot exceed 1000 characters.");
    return;
  }

  submitReviewBtn.disabled = true;
  submitReviewBtn.textContent = "Submitting...";

  try {
    const response = await authenticatedFetch(
      `${API_URL}/reviews/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          rating: selectedRating,
          comment: comment || null
        })
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Could not submit review."
      );
    }

    clientReviews.unshift(data);

    closeReviewModal();
    renderBookings(bookings);

    showMessage(
      "Your review was submitted successfully.",
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
      error.message || "Could not submit review."
    );
  } finally {
    submitReviewBtn.disabled = false;
    submitReviewBtn.textContent = "Submit Review";
  }
}

async function cancelBooking(bookingId) {
  const confirmCancel = confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmCancel) return;

  try {
    showMessage(
      "Cancelling booking...",
      "success"
    );

    const response = await authenticatedFetch(
      `${API_URL}/bookings/cancel/${bookingId}`,
      {
        method: "PUT"
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.message || "Could not cancel booking."
      );
    }

    showMessage(
      "Booking cancelled successfully.",
      "success"
    );

    await loadPage();
  } catch (error) {
    if (
      error.message === "Account frozen" ||
      error.message === "Session expired"
    ) {
      return;
    }

    showMessage(
      error.message || "Could not cancel booking."
    );
  }
}


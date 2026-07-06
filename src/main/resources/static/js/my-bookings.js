const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");

const bookingsGrid = document.getElementById("bookingsGrid");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

if (!token) {
  location.href = "login.html";
}

logoutBtn?.addEventListener("click", logout);

loadBookings();

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

function formatDateTime(dateTime) {
  if (!dateTime) return "No date";

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return dateTime;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function getServiceName(booking) {
  return booking.service?.name || booking.serviceName || "Service";
}

function renderBookings(bookings) {
  if (!bookingsGrid) return;

  if (!bookings || bookings.length === 0) {
    bookingsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>No bookings found</h3>
        <p>Your appointments will appear here after booking a service.</p>
      </div>
    `;
    return;
  }

  bookingsGrid.innerHTML = bookings.map((booking) => {
    const serviceName = getServiceName(booking);
    const appointmentTime = formatDateTime(booking.appointmentTime);
    const status = (booking.status || "PENDING").toUpperCase();
    const statusClass = status.toLowerCase();

    const cancelButton = status !== "CANCELLED"
      ? `
        <button class="btn btn-danger booking-cancel-btn" onclick="cancelBooking(${Number(booking.id)})">
          Cancel Booking
        </button>
      `
      : "";

    return `
      <article class="item-card booking-card">
        <div class="booking-card-header">
          <span class="badge status-${escapeHTML(statusClass)}">${escapeHTML(status)}</span>
        </div>

        <h3>${escapeHTML(serviceName)}</h3>

        <p>
          <strong>Appointment:</strong>
          ${escapeHTML(appointmentTime)}
        </p>

        <p>
          <strong>Status:</strong>
          ${escapeHTML(status)}
        </p>

        <div class="booking-actions">
          ${cancelButton}
        </div>
      </article>
    `;
  }).join("");
}

async function loadBookings() {
  showMessage("Loading bookings...", "success");

  try {
    const response = await fetch(`${API_URL}/bookings/my`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const data = await response.json().catch(() => []);

    if (response.status === 401 || response.status === 403) {
      showMessage("Session expired or access denied. Please log in again.");
      localStorage.clear();

      setTimeout(() => {
        location.href = "login.html";
      }, 900);

      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not load bookings.");
    }

    showMessage("");
    renderBookings(Array.isArray(data) ? data : []);
  } catch (error) {
    showMessage(error.message || "Could not load bookings.");
    bookingsGrid.innerHTML = "";
  }
}

async function cancelBooking(bookingId) {
  const confirmCancel = confirm("Are you sure you want to cancel this booking?");

  if (!confirmCancel) return;

  try {
    showMessage("Cancelling booking...", "success");

    const response = await fetch(`${API_URL}/bookings/cancel/${bookingId}`, {
      method: "PUT",
      headers: getAuthHeaders()
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      showMessage("Session expired or access denied. Please log in again.");
      localStorage.clear();

      setTimeout(() => {
        location.href = "login.html";
      }, 900);

      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not cancel booking.");
    }

    showMessage("Booking cancelled successfully.", "success");
    loadBookings();
  } catch (error) {
    showMessage(error.message || "Could not cancel booking.");
  }
}
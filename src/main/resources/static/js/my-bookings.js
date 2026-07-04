const API_URL = "http://localhost:8080";
const token = localStorage.getItem("booky_token");

const bookingsGrid = document.getElementById("bookingsGrid");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

if (!token) {
  location.href = "login.html";
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");
  location.href = "login.html";
});

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

function formatDateTime(dateTime) {
  if (!dateTime) return "No date";

  const date = new Date(dateTime);

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function getServiceName(booking) {
  return (
    booking.service?.name ||
    booking.serviceName ||
    "Service"
  );
}

function renderBookings(bookings) {
  if (!bookings || bookings.length === 0) {
    bookingsGrid.innerHTML = `
      <div class="empty">
        No bookings found.
      </div>
    `;
    return;
  }

  bookingsGrid.innerHTML = bookings.map(booking => {
    const serviceName = getServiceName(booking);
    const appointmentTime = formatDateTime(booking.appointmentTime);
    const status = booking.status || "PENDING";

    const statusClass = status.toLowerCase();

    const cancelButton = status !== "CANCELLED"
      ? `
        <button class="btn btn-danger booking-cancel-btn" onclick="cancelBooking(${booking.id})">
          Cancel Booking
        </button>
      `
      : "";

    return `
      <article class="item-card booking-card">
        <div class="booking-card-header">
          <span class="badge status-${statusClass}">${status}</span>
        </div>

        <h3>${serviceName}</h3>

        <p>
          <strong>Appointment:</strong>
          ${appointmentTime}
        </p>

        <p>
          <strong>Status:</strong>
          ${status}
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

    if (response.status === 401 || response.status === 403) {
      showMessage("Session expired or access denied. Please login again.");
      localStorage.clear();
      setTimeout(() => {
        location.href = "login.html";
      }, 1000);
      return;
    }

    if (!response.ok) {
      throw new Error("Could not load bookings.");
    }

    const bookings = await response.json();

    showMessage("");
    renderBookings(bookings);

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

    if (response.status === 401 || response.status === 403) {
      showMessage("Session expired or access denied. Please login again.");
      localStorage.clear();
      setTimeout(() => {
        location.href = "login.html";
      }, 1000);
      return;
    }

    if (!response.ok) {
      throw new Error("Could not cancel booking.");
    }

    showMessage("Booking cancelled successfully.", "success");
    loadBookings();

  } catch (error) {
    showMessage(error.message || "Could not cancel booking.");
  }
}

loadBookings();
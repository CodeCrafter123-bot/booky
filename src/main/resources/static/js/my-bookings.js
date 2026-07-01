const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user"));
const grid = document.getElementById("bookingsGrid");
const message = document.getElementById("message");

if (!token || !user) location.href = "login.html";

function getAuthHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("booky_token") };
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function formatDate(value) {
  if (!value) return "Not specified";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function render(bookings) {
  if (!bookings.length) {
    grid.innerHTML = `<div class="empty">No bookings yet.</div>`;
    return;
  }

  grid.innerHTML = bookings.map(b => {
    const status = String(b.status || "PENDING").toLowerCase();
    return `
      <article class="item-card">
        <span class="badge ${status}">${b.status || "PENDING"}</span>
        <h3>${b.serviceName || `Service #${b.serviceId}`}</h3>
        <p><strong>Appointment:</strong><br>${formatDate(b.appointmentTime)}</p>
        <p class="muted">Booking ID: ${b.id}</p>
        ${b.status === "PENDING" ? `<button class="btn btn-danger" onclick="cancelBooking(${b.id})">Cancel</button>` : ""}
      </article>
    `;
  }).join("");
}

async function loadBookings() {
  showMessage("Loading bookings...", "success");
  try {
    const response = await fetch(`http://localhost:8080/bookings/user/${user.id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Could not load bookings.");
    const bookings = await response.json();
    showMessage("");
    render(bookings);
  } catch (error) {
    showMessage(error.message || "Could not load bookings.");
    grid.innerHTML = "";
  }
}

async function cancelBooking(bookingId) {
  showMessage("Cancelling booking...", "success");
  try {
    const response = await fetch(`http://localhost:8080/bookings/cancel/${bookingId}`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Could not cancel booking.");
    showMessage("Booking cancelled successfully.", "success");
    loadBookings();
  } catch (error) {
    showMessage(error.message || "Could not cancel booking.");
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadBookings);
loadBookings();

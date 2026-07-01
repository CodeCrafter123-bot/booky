const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user"));
const serviceIdInput = document.getElementById("serviceId");
const form = document.getElementById("bookForm");
const message = document.getElementById("message");
const button = document.getElementById("bookBtn");

if (!token || !user) location.href = "login.html";

function getAuthHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("booky_token") };
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

const selectedServiceId = localStorage.getItem("selected_service_id");
if (selectedServiceId) serviceIdInput.value = selectedServiceId;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const serviceId = Number(serviceIdInput.value);
  const appointmentTimeRaw = document.getElementById("appointmentTime").value;

  if (user.role !== "CLIENT") return showMessage("Only CLIENT users can create bookings.");
  if (!serviceId) return showMessage("Service ID is required.");
  if (!appointmentTimeRaw) return showMessage("Appointment date/time is required.");

  const appointmentTime = appointmentTimeRaw.length === 16 ? `${appointmentTimeRaw}:00` : appointmentTimeRaw;

  button.disabled = true;
  button.textContent = "Booking...";

  try {
    const response = await fetch("http://localhost:8080/bookings/create", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentTime, userId: user.id, serviceId })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Could not create booking.");
    showMessage("Booking confirmed. Redirecting...", "success");
    localStorage.removeItem("selected_service_id");
    setTimeout(() => location.href = "my-bookings.html", 900);
  } catch (error) {
    showMessage(error.message || "Could not create booking.");
  } finally {
    button.disabled = false;
    button.textContent = "Confirm Booking";
  }
});

const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");
const serviceId = localStorage.getItem("selected_service_id");

const form = document.getElementById("bookingForm");
const message = document.getElementById("message");
const appointmentTimeInput = document.getElementById("appointmentTime");

if (!token) {
  location.href = "login.html";
}

if (!serviceId) {
  showMessage("No service selected. Please go back and choose a service.");
}

setMinimumAppointmentTime();

form?.addEventListener("submit", createBooking);

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

function setMinimumAppointmentTime() {
  if (!appointmentTimeInput) return;

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 5);

  appointmentTimeInput.min = now.toISOString().slice(0, 16);
}

async function createBooking(event) {
  event.preventDefault();

  const appointmentTime = appointmentTimeInput.value;

  if (!serviceId) {
    showMessage("No service selected. Please choose a service first.");
    return;
  }

  if (!appointmentTime) {
    showMessage("Please choose an appointment time.");
    return;
  }

  try {
    showMessage("Creating booking...", "success");

    const response = await fetch(`${API_URL}/bookings/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        appointmentTime,
        serviceId: Number(serviceId)
      })
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      throw new Error(data.message || "Session expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not create booking.");
    }

    showMessage("Booking created successfully!", "success");

    setTimeout(() => {
      location.href = "my-bookings.html";
    }, 1000);
  } catch (error) {
    showMessage(error.message || "Could not create booking.");
  }
}
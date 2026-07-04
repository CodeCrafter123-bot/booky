const API_URL = "http://localhost:8080";
const token = localStorage.getItem("booky_token");

const serviceId = localStorage.getItem("selected_service_id");
const form = document.getElementById("bookingForm");
const message = document.getElementById("message");

if (!token) {
  location.href = "login.html";
}

if (!serviceId) {
  showMessage("No service selected. Please go back and choose a service.");
}

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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const appointmentTime = document.getElementById("appointmentTime").value;

  if (!appointmentTime) {
    showMessage("Please choose an appointment time.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/bookings/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        appointmentTime,
        serviceId: Number(serviceId)
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Could not create booking.");
    }

    showMessage("Booking created successfully!", "success");

    setTimeout(() => {
      location.href = "my-bookings.html";
    }, 1200);

  } catch (error) {
    showMessage(error.message || "Could not create booking.");
  }
});
const API_URL = "http://127.0.0.1:8080";

const token = localStorage.getItem("booky_token");
const serviceId = localStorage.getItem("selected_service_id");

const form = document.getElementById("bookingForm");
const message = document.getElementById("message");
const appointmentDateInput = document.getElementById("appointmentDate");
const loadSlotsBtn = document.getElementById("loadSlotsBtn");
const slotsContainer = document.getElementById("slotsContainer");

let selectedSlot = null;

if (!token) {
  location.href = "login.html";
}

if (!serviceId) {
  showMessage("No service selected. Please go back and choose a service.");
}

setMinimumDate();

loadSlotsBtn?.addEventListener("click", loadAvailableSlots);
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

function setMinimumDate() {
  if (!appointmentDateInput) return;

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

  appointmentDateInput.min = today.toISOString().slice(0, 10);
}

async function loadAvailableSlots() {
  selectedSlot = null;
  slotsContainer.innerHTML = "";

  const date = appointmentDateInput.value;

  if (!date) {
    showMessage("Please choose a date first.");
    return;
  }

  try {
    showMessage("Loading available times...", "success");

    const response = await fetch(
      `${API_URL}/availability/slots?serviceId=${Number(serviceId)}&date=${date}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error(data.message || "Could not load available times.");
    }

    if (!Array.isArray(data) || data.length === 0) {
      showMessage("No available times for this date.");
      return;
    }

    renderSlots(data);
    showMessage("Choose one of the available times.", "success");

  } catch (error) {
    showMessage(error.message || "Could not load available times.");
  }
}

function renderSlots(slots) {
  slotsContainer.innerHTML = "";

  slots.forEach((slot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slot-btn";
    button.textContent = slot.slice(0, 5);

    button.addEventListener("click", () => {
      selectedSlot = slot.slice(0, 5);

      document.querySelectorAll(".slot-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
    });

    slotsContainer.appendChild(button);
  });
}

async function createBooking(event) {
  event.preventDefault();

  const date = appointmentDateInput.value;

  if (!serviceId) {
    showMessage("No service selected. Please choose a service first.");
    return;
  }

  if (!date) {
    showMessage("Please choose an appointment date.");
    return;
  }

  if (!selectedSlot) {
    showMessage("Please choose an available time slot.");
    return;
  }

  const appointmentTime = `${date}T${selectedSlot}:00`;

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
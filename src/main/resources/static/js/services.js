const API_URL = "http://localhost:8080";
const token = localStorage.getItem("booky_token");

const servicesGrid = document.getElementById("servicesGrid");
const message = document.getElementById("message");

const businessId = localStorage.getItem("selected_business_id");

if (!token) {
  location.href = "login.html";
}

if (!businessId) {
  message.textContent = "No business selected. Go back and choose a business.";
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

function renderServices(services) {
  if (!services.length) {
    servicesGrid.innerHTML = `<div class="empty">No services found for this business.</div>`;
    return;
  }

  servicesGrid.innerHTML = services.map(service => `
    <article class="item-card">
      <span class="badge">${service.active ? "Active" : "Inactive"}</span>
      <h3>${service.name}</h3>
      <p>${service.description || "No description available."}</p>
      <p><strong>Duration:</strong> ${service.durationMinutes} minutes</p>
      <p><strong>Price:</strong> $${service.price}</p>
      <button class="btn btn-primary" onclick="bookService(${service.id})">
        Book Now
      </button>
    </article>
  `).join("");
}

function bookService(serviceId) {
  localStorage.setItem("selected_service_id", serviceId);
  location.href = "book.html";
}

async function loadServices() {
  if (!businessId) return;

  showMessage("Loading services...", "success");

  try {
    const response = await fetch(`${API_URL}/services/business/${businessId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error("Could not load services.");
    }

    const services = await response.json();

    showMessage("");
    renderServices(services);

  } catch (error) {
    showMessage(error.message || "Could not load services.");
    servicesGrid.innerHTML = "";
  }
}

loadServices();
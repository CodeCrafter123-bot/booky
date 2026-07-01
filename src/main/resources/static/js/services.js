const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user"));
const selectedBusinessId = localStorage.getItem("selected_business_id");
const grid = document.getElementById("servicesGrid");
const message = document.getElementById("message");
const ownerPanel = document.getElementById("ownerPanel");
const serviceForm = document.getElementById("serviceForm");

if (!token || !user) location.href = "login.html";

function getAuthHeaders() {
  return { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("booky_token") };
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function canManageServices() {
  return user.role === "OWNER" || user.role === "ADMIN";
}

if (canManageServices()) ownerPanel.classList.remove("hidden");
if (selectedBusinessId) document.getElementById("pageSubtitle").textContent = `Viewing services for business #${selectedBusinessId}.`;

function render(services) {
  if (!services.length) {
    grid.innerHTML = `<div class="empty">No services found.</div>`;
    return;
  }
  grid.innerHTML = services.map(s => `
    <article class="item-card">
      <span class="badge ${s.active ? "active" : ""}">${s.active ? "ACTIVE" : "INACTIVE"}</span>
      <h3>${s.name || "Service"}</h3>
      <p>${s.description || "No description available."}</p>
      <p><strong>Duration:</strong> ${s.durationMinutes || 0} minutes</p>
      <p><strong>Price:</strong> $${Number(s.price || 0).toFixed(2)}</p>
      <p class="muted">Service ID: ${s.id}</p>
      ${user.role === "CLIENT" ? `<button class="btn btn-primary" onclick="bookNow(${s.id})">Book Now</button>` : ""}
    </article>
  `).join("");
}

function bookNow(serviceId) {
  localStorage.setItem("selected_service_id", serviceId);
  location.href = "book.html";
}

async function loadServices() {
  const url = selectedBusinessId
    ? `http://localhost:8080/services/business/${selectedBusinessId}`
    : "http://localhost:8080/services";

  showMessage("Loading services...", "success");
  try {
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Could not load services.");
    const services = await response.json();
    showMessage("");
    render(services);
  } catch (error) {
    showMessage(error.message || "Could not load services.");
    grid.innerHTML = "";
  }
}

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageServices()) return showMessage("Only OWNER or ADMIN can add services.");

  const button = document.getElementById("addServiceBtn");
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const durationMinutes = Number(document.getElementById("durationMinutes").value);
  const price = Number(document.getElementById("price").value);
  const businessId = Number(document.getElementById("businessId").value);

  if (!name || !description || !durationMinutes || !price || !businessId) return showMessage("Please complete all service fields.");

  button.disabled = true;
  button.textContent = "Adding...";
  try {
    const response = await fetch("http://localhost:8080/services/add", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, description, durationMinutes, price, active: true, business: { id: businessId } })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Could not add service.");
    showMessage("Service added successfully.", "success");
    serviceForm.reset();
    loadServices();
  } catch (error) {
    showMessage(error.message || "Could not add service.");
  } finally {
    button.disabled = false;
    button.textContent = "Add Service";
  }
});

loadServices();

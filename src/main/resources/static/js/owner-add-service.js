const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user || user.role !== "OWNER") {
  location.href = "login.html";
}

const serviceForm = document.getElementById("serviceForm");
const businessSelect = document.getElementById("businessId");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatarInitial = document.getElementById("avatarInitial");

const displayName = user.fullName || user.name || user.email || "Owner";

userName.textContent = displayName;
userRole.textContent = user.role;
avatarInitial.textContent = displayName.charAt(0).toUpperCase();

logoutBtn?.addEventListener("click", logout);
serviceForm?.addEventListener("submit", addService);

loadBusinesses();

function logout() {
  localStorage.clear();
  location.href = "login.html";
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = text ? `message ${type}` : "message";
}

function getInputValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

async function loadBusinesses() {
  try {
    const response = await fetch(`${API_URL}/businesses`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const businesses = await response.json();

    const ownerBusinesses = businesses.filter(
      business => business.ownerId === user.id
    );

    if (!ownerBusinesses.length) {
      businessSelect.innerHTML = `
        <option value="">No businesses found. Add a business first.</option>
      `;
      showMessage("You need to add a business before adding services.");
      return;
    }

    businessSelect.innerHTML = `
      <option value="">Select your business</option>
      ${ownerBusinesses.map(business => `
        <option value="${business.id}">
          ${business.name}
        </option>
      `).join("")}
    `;

  } catch (error) {
    showMessage("Could not load your businesses.");
  }
}

async function addService(event) {
  event.preventDefault();

  const serviceData = {
    businessId: Number(getInputValue("businessId")),
    name: getInputValue("name"),
    description: getInputValue("description"),
    durationMinutes: Number(getInputValue("durationMinutes")),
    price: Number(getInputValue("price")),
    active: true
  };

  if (!serviceData.businessId) {
    showMessage("Please select a business.");
    return;
  }

  if (!serviceData.name || !serviceData.description) {
    showMessage("Service name and description are required.");
    return;
  }

  if (serviceData.durationMinutes <= 0) {
    showMessage("Duration must be greater than 0.");
    return;
  }

  if (serviceData.price <= 0) {
    showMessage("Price must be greater than 0.");
    return;
  }

  try {
    showMessage("Adding service...", "success");

    const response = await fetch(`${API_URL}/services/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Could not add service.");
    }

    showMessage("Service added successfully!", "success");
    serviceForm.reset();

  } catch (error) {
    showMessage(error.message || "Could not add service.");
  }
}
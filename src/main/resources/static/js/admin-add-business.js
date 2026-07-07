const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  location.href = "login.html";
}

if (user?.role !== "ADMIN" && user?.role !== "OWNER") {
  alert("Access denied. Owners or Admins only.");
  location.href = "dashboard.html";
}

const businessForm = document.getElementById("businessForm");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", logout);

businessForm?.addEventListener("submit", addBusiness);

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

function getInputValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

function validateBusiness(data) {
  if (!data.name) return "Business name is required.";
  if (!data.type) return "Business type is required.";
  if (!data.location) return "Location is required.";
  if (!data.description) return "Description is required.";
  return "";
}

async function addBusiness(event) {
  event.preventDefault();

  const businessData = {
    name: getInputValue("name"),
    type: getInputValue("type"),
    location: getInputValue("location"),
    description: getInputValue("description")
  };

  const validationError = validateBusiness(businessData);

  if (validationError) {
    showMessage(validationError);
    return;
  }

  try {
    showMessage("Adding business...", "success");

    const response = await fetch(`${API_URL}/businesses/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(businessData)
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      throw new Error(data.message ||"Access denied. Please log in again as owner or admin.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not add business.");
    }

    showMessage("Business added successfully!", "success");
    businessForm.reset();

    setTimeout(() => {
      location.href = user.role === "ADMIN" ? "admin.html" : "dashboard.html";
    }, 900);
  } catch (error) {
    showMessage(error.message || "Could not add business.");
  }
}
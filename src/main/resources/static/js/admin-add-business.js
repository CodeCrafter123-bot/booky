const API_URL = "http://localhost:8080";

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  location.href = "login.html";
}

if (user.role !== "ADMIN") {
  alert("Access denied. Admins only.");
  location.href = "dashboard.html";
}

const businessForm = document.getElementById("businessForm");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  location.href = "login.html";
});

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  };
}

businessForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const businessData = {
    name: document.getElementById("name").value.trim(),
    type: document.getElementById("type").value.trim(),
    location: document.getElementById("location").value.trim(),
    description: document.getElementById("description").value.trim()
  };

  try {
    showMessage("Adding business...", "success");

    const response = await fetch(`${API_URL}/businesses/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(businessData)
    });

    if (response.status === 403) {
      throw new Error("Admin is not allowed to add businesses yet. Backend permission must be updated.");
    }

    if (!response.ok) {
      throw new Error("Could not add business.");
    }

    showMessage("Business added successfully!", "success");
    businessForm.reset();

    setTimeout(() => {
      location.href = "admin.html";
    }, 1000);

  } catch (error) {
    showMessage(error.message || "Could not add business.");
  }
});
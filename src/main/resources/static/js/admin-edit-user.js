const API_URL = "http://127.0.0.1:8080";

const token = localStorage.getItem("booky_token");
const adminUser = JSON.parse(localStorage.getItem("booky_user") || "null");
const selectedUserId = localStorage.getItem("selected_admin_user_id");

const logoutBtn = document.getElementById("logoutBtn");
const editUserForm = document.getElementById("editUserForm");
const saveBtn = document.getElementById("saveBtn");
const message = document.getElementById("message");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const roleInput = document.getElementById("role");

const summaryId = document.getElementById("summaryId");
const summaryName = document.getElementById("summaryName");
const summaryEmail = document.getElementById("summaryEmail");
const summaryPhone = document.getElementById("summaryPhone");
const summaryRole = document.getElementById("summaryRole");

if (!token || !adminUser) {
  location.href = "login.html";
}

if (adminUser.role !== "ADMIN") {
  alert("Access denied. Admins only.");
  location.href = "dashboard.html";
}

if (!selectedUserId) {
  location.href = "admin-users.html";
}

logoutBtn?.addEventListener("click", logout);
editUserForm?.addEventListener("submit", updateUser);

loadUser();

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");
  localStorage.removeItem("selected_admin_user_id");

  location.href = "login.html";
}

function showMessage(text, type = "error") {
  if (!message) return;
  message.textContent = text;
  message.className = text ? `message ${type}` : "message";
}

async function loadUser() {
  try {
    const response = await fetch(`${API_URL}/admin/users/${selectedUserId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Failed to load user.");
    }

    fillForm(data);
    fillSummary(data);
  } catch (error) {
    showMessage(error.message || "Something went wrong.");
  }
}

async function updateUser(event) {
  event.preventDefault();

  const updatedUser = {
    fullName: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    role: roleInput.value
  };

  if (!updatedUser.fullName || !updatedUser.email || !updatedUser.phone || !updatedUser.role) {
    showMessage("All fields are required.");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  showMessage("");

  try {
    const response = await fetch(`${API_URL}/admin/users/${selectedUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedUser)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Failed to update user.");
    }

    fillForm(data);
    fillSummary(data);

    if (adminUser.id === data.id) {
      localStorage.setItem("booky_user", JSON.stringify(data));
    }

    showMessage("User updated successfully.", "success");
  } catch (error) {
    showMessage(error.message || "Something went wrong.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Changes";
  }
}

function fillForm(user) {
  fullNameInput.value = user.fullName || "";
  emailInput.value = user.email || "";
  phoneInput.value = user.phone || "";
  roleInput.value = user.role || "CLIENT";
}

function fillSummary(user) {
  summaryId.textContent = `#${user.id}`;
  summaryName.textContent = user.fullName || "-";
  summaryEmail.textContent = user.email || "-";
  summaryPhone.textContent = user.phone || "-";
  summaryRole.textContent = user.role || "-";
}
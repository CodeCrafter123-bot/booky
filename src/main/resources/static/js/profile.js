const t = window.bookyI18n.start();

const API_URL = "";

const logoutBtn = document.getElementById("logoutBtn");
const profileForm = document.getElementById("profileForm");
const saveBtn = document.getElementById("saveBtn");

const profileAvatar = document.getElementById("profileAvatar");
const profileTitle = document.getElementById("profileTitle");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const roleInput = document.getElementById("role");

const summaryName = document.getElementById("summaryName");
const summaryEmail = document.getElementById("summaryEmail");
const summaryPhone = document.getElementById("summaryPhone");
const summaryRole = document.getElementById("summaryRole");

const message = document.getElementById("message");

const token = localStorage.getItem("booky_token");
let user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  location.href = "login.html";
}

logoutBtn?.addEventListener("click", logout);
profileForm?.addEventListener("submit", updateProfile);

loadProfile();

function logout() {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");

  location.href = "login.html";
}

function showMessage(text, type = "error") {
  if (!message) return;

  message.textContent = text;
  message.className = text ? `message ${type}` : "message";
}

function loadProfile() {
  const fullName = user.fullName || user.name || user.username || "";
  const email = user.email || "";
  const phone = user.phone || "";
  const role = user.role || "";

  fullNameInput.value = fullName;
  emailInput.value = email;
  phoneInput.value = phone;
  roleInput.value = t(`role.${role.toLowerCase()}`, role);

  summaryName.textContent = fullName || "-";
  summaryEmail.textContent = email || "-";
  summaryPhone.textContent = phone || "-";
  summaryRole.textContent = role ? t(`role.${role.toLowerCase()}`, role) : "-";

  profileTitle.textContent = fullName
    ? t("profile.hello", "Hello, {name}", { name: fullName })
    : t("profile.heading", "My Profile");
  profileAvatar.textContent = fullName ? fullName.charAt(0).toUpperCase() : "U";

  showMessage("");
}

async function updateProfile(event) {
  event.preventDefault();

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!fullName || !email || !phone) {
    showMessage(t("profile.required", "Full name, email, and phone number are required."));
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = t("common.saving", "Saving...");
  showMessage("");

  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName,
        email,
        phone
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(bookyI18n.tm(data?.message) || t("profile.updateError", "Failed to update profile."));
    }

    user = {
      ...user,
      ...data
    };

    localStorage.setItem("booky_user", JSON.stringify(user));

    loadProfile();
    showMessage(t("profile.updated", "Profile updated successfully."), "success");
  } catch (error) {
    showMessage(error.message || t("common.error", "Something went wrong."));
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = t("common.saveChanges", "Save Changes");
  }
}
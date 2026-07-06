const logoutBtn = document.getElementById("logoutBtn");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const role = document.getElementById("role");

const message = document.getElementById("message");

const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user"));

if (!token || !user) {
    location.href = "login.html";
}

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("booky_token");
    localStorage.removeItem("booky_user");
    localStorage.removeItem("selected_business_id");
    localStorage.removeItem("selected_service_id");

    location.href = "login.html";
});

function loadProfile() {

    fullName.textContent =
        user.name ||
        user.fullName ||
        user.username ||
        "Unknown";

    email.textContent =
        user.email || "-";

    role.textContent =
        user.role || "-";
}

loadProfile();
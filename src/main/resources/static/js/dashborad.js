const user = JSON.parse(localStorage.getItem("booky_user"));
const token = localStorage.getItem("booky_token");

if (!user || !token) location.href = "login.html";

function logout() {
  localStorage.removeItem("booky_user");
  localStorage.removeItem("booky_token");
  localStorage.removeItem("selected_business_id");
  localStorage.removeItem("selected_service_id");
  location.href = "login.html";
}

const actionsByRole = {
  CLIENT: [
    ["Book an appointment", "Choose a service and reserve your time.", "book.html"],
    ["My bookings", "View and cancel pending bookings.", "my-bookings.html"],
    ["Browse businesses", "Find clinics, barbers, gyms, tutors, and more.", "browse.html"],
    ["Edit profile", "View your account details.", "profile.html"]
  ],
  OWNER: [
    ["Manage services", "Add and view services for your business.", "services.html"],
    ["View bookings", "Track client appointments.", "my-bookings.html"],
    ["Manage business", "Business page placeholder.", "business.html"],
    ["Edit profile", "View your account details.", "profile.html"]
  ],
  ADMIN: [
    ["Manage users", "Admin users page placeholder.", "admin-users.html"],
    ["Manage businesses", "Admin businesses page placeholder.", "admin-businesses.html"],
    ["All bookings", "Admin bookings page placeholder.", "admin-bookings.html"],
    ["Reports", "Reports page placeholder.", "admin-reports.html"]
  ]
};

document.getElementById("userName").textContent = user.fullName || "Booky User";
document.getElementById("userRole").textContent = user.role || "CLIENT";
document.getElementById("roleBadge").textContent = user.role || "CLIENT";
document.getElementById("avatar").textContent = (user.fullName || "U")[0].toUpperCase();
document.getElementById("welcomeText").textContent = `Welcome back, ${user.fullName || "Booky User"}. Choose an action to continue.`;
document.getElementById("logoutBtn").addEventListener("click", logout);

const grid = document.getElementById("actionsGrid");
const actions = actionsByRole[user.role] || actionsByRole.CLIENT;
grid.innerHTML = actions.map(([title, desc, link]) => `
  <article class="item-card action-card">
    <div><span class="badge">${user.role || "CLIENT"}</span><h3>${title}</h3><p>${desc}</p></div>
    <a class="btn btn-primary" href="${link}">Open</a>
  </article>
`).join("");

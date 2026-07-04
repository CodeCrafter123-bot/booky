const token = localStorage.getItem("booky_token");
const user = JSON.parse(localStorage.getItem("booky_user") || "null");

if (!token || !user) {
  window.location.href = "login.html";
}

const sidebarNav = document.getElementById("sidebarNav");
const actionGrid = document.getElementById("actionGrid");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatarInitial = document.getElementById("avatarInitial");
const welcomeHeading = document.getElementById("welcomeHeading");
const logoutBtn = document.getElementById("logoutBtn");

userName.textContent = user.fullName || "User";
userRole.textContent = user.role || "CLIENT";
avatarInitial.textContent = (user.fullName || "?").charAt(0).toUpperCase();
welcomeHeading.textContent = `Welcome back, ${user.fullName || "User"} 👋`;

const linksByRole = {
  CLIENT: [
    { title: "Browse Businesses", description: "Find businesses and book services.", icon: "🏢", href: "browse.html" },
    { title: "My Bookings", description: "View and cancel your appointments.", icon: "📅", href: "my-bookings.html" },
    { title: "Profile", description: "Manage your account details.", icon: "👤", href: "profile.html" }
  ],
  OWNER: [
    { title: "Browse Businesses", description: "View listed businesses.", icon: "🏢", href: "browse.html" },
    { title: "Manage Services", description: "Add and view your services.", icon: "🛠️", href: "services.html" },
    { title: "My Bookings", description: "View appointment activity.", icon: "📅", href: "my-bookings.html" },
    { title: "Profile", description: "Manage your account details.", icon: "👤", href: "profile.html" }
  ],
  ADMIN: [
    { title: "Browse Businesses", description: "View all businesses.", icon: "🏢", href: "browse.html" },
    { title: "All Services", description: "View services.", icon: "🛠️", href: "services.html" },
    { title: "Bookings", description: "View bookings.", icon: "📅", href: "my-bookings.html" }
  ]
};

const links = linksByRole[user.role] || linksByRole.CLIENT;

sidebarNav.innerHTML = links.map(link => `
  <a href="${link.href}" class="sidebar-link">
    <span>${link.icon}</span>
    <span>${link.title}</span>
  </a>
`).join("");

actionGrid.innerHTML = links.map(link => `
  <a href="${link.href}" class="glass-card hoverable action-card">
    <div class="action-icon">${link.icon}</div>
    <h3>${link.title}</h3>
    <p>${link.description}</p>
  </a>
`).join("");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("booky_token");
  localStorage.removeItem("booky_user");
  window.location.href = "login.html";
});